import * as Mongo from 'mongodb';
import * as Model from '../model/task'
import * as Util from '../router/util'

var  _db  : Mongo.Db          = null;
var  _cl  : Mongo.Collection  = null;

export function connect(db : Mongo.Db) {
    _db = db;
    _cl = db.collection('tasks');

    //Migration to add completed_time and created_time field
    _cl.find({}).limit(1).next()
        .then((task: Model.Task) => {
            if (task.created_time == null) {
                _cl.find({}).forEach(
                    (task: Model.Task) => {
                        var created_time = task.duration.length > 0 ? task.duration[task.duration.length - 1].begin : new Date();
                        var completed_time = null;
                        if (task.state == Model.State.COMPLETED)
                            completed_time = task.duration.length > 0 ? task.duration[0].end : new Date();

                        _cl.updateOne(
                            {_id: task._id},
                            {
                                $set : {
                                    created_time:   created_time,
                                    completed_time: completed_time
                                }
                            },
                            (error, result) => {
                                if (result.matchedCount == 1) {
                                    console.log("Updating task: " +  task._id + ", created_time: " + task.created_time + ", completed_time: " + task.completed_time);
                                }
                                if (error) {
                                    console.log("Update error: " + JSON.stringify(error));
                                }
                            }
                        );
                    },
                    (error) => {
                        if (error) {
                            console.log("Find error: " + JSON.stringify(error));
                        }
                    }
                );
            }
        });
}

function toId(_id: string | Mongo.ObjectID) : Mongo.ObjectID {
    if (typeof _id === "string")
        _id = new Mongo.ObjectID(<string>_id);
    return <Mongo.ObjectID>_id;
}

function toIds(_ids: (string | Mongo.ObjectID)[]) : Mongo.ObjectID[] {
    for(var i in _ids)
        _ids[i] = toId(_ids[i]);
    return <Mongo.ObjectID[]>_ids;
}

export function get(_id: string | Mongo.ObjectID) : Promise<Model.Task> {
    return _cl.find({_id: toId(_id)}).next();
}

export function getMany(_ids: (string | Mongo.ObjectID)[]) : Promise<Model.Task[]> {
    return _cl.find({_id: {$in: toIds(_ids)}}).toArray();
}

export function getAll(query: Model.Query) : Promise<Model.Task[]> {
    var filter = {
        user_id: query.user_id,
    };
    if (query.state != null) {
        var states = [];
        [].concat(query.state).forEach((state) => states.push(parseInt(state)));
        filter['state'] = {$in: states};
    }
    if (query.completed_period != null) {
        filter['completed_time'] = {
            $gte: query.completed_period.begin,
            $lt: query.completed_period.end
        };
    }
    //console.log("Filter: " + JSON.stringify(filter));
    return _cl.find(filter).sort({
        'scheduled': 1,
        'duration.0.end': -1
    }).toArray();
}

export function getRunning() : Promise<Model.Task[]> {
    return _cl.find({state: Model.State.RUNNING}).toArray();
}

export function insert( user_id:    string,
                        title:      string,
                        subject:    string,
                        category:   string,
                        context:    string,
                        project:    string,
                        story:      string,
                        scheduled:  Date,
                        collapsed:  boolean,
                        created_time:  Date) : Promise<Model.Task> {
    var task : Model.Task = {
        user_id:   user_id,
        state:     Model.State.PAUSED,
        title:     title || "",
        subject:   subject || "",
        category:  category || "",
        context:   context || "",
        project:   project || "",
        story:     story || "",
        scheduled: scheduled || null,
        duration:  [],
        collapsed: collapsed == null ? true : collapsed,
        created_time: created_time || null,
        completed_time: null
    };
    return _cl.insertOne(task)
        .then(() => {return task});
}

export function update(_id: string | Mongo.ObjectID, update: any) : Promise<Model.Task> {
    return _cl.updateOne({_id: toId(_id)}, update)
                .then(() => get(_id));
}

export function updateMany(_ids: (string | Mongo.ObjectID)[], update: any) : Promise<Model.Task[]> {
    return _cl.updateMany({_id:  {$in: toIds(_ids)}}, update).then(() => getMany(_ids));
}

export function remove(_id: string | Mongo.ObjectID) : Promise<Model.Task> {
    return get(toId(_id))
            .then((task) => {
                return _cl.deleteOne({_id: toId(_id)})
                    .then(()=>task);
            });
}

export function removeDuration(_id: string | Mongo.ObjectID, index: number) : Promise<Model.Task> {
    return _cl.updateOne({_id: toId(_id)}, {$unset : {["duration." + index] : 1 }})
            .then(() => _cl.updateOne({_id: toId(_id)}, {$pull : {"duration" : null}}))
            .then(() => get(_id));
}

function pauseRunningTasks(_ids: Mongo.ObjectID[], pauseState: Model.State, time: Date) : Promise<Model.Task[]> {
    return updateMany(
        _ids,
        {$set: {
            state:              pauseState,
            'duration.0.end':   time || new Date()
        }}
    );
}
export function pauseTask(_id: string | Mongo.ObjectID, time: Date) : Promise<Model.Task> {
    return get(_id).then((task) => {
        switch(task.state) {
            case Model.State.PAUSED:
                return task;

            case Model.State.RUNNING:
                return pauseRunningTasks([toId(_id)], Model.State.PAUSED, time).then((tasks) => tasks[0]);
        }
        return update(_id, {$set: {
            state: Model.State.PAUSED,
            completed_time: null
        }});
    });
}

function startTask(_id: string | Mongo.ObjectID, time: Date) : Promise<Model.Task> {
    return update(_id, {
        $set: {
            state: Model.State.RUNNING,
            scheduled: null,
            completed_time: null
        },
        $push:{'duration':  { $each: [{begin: time || new Date(), end: null}], $position: 0}}
    })
}

export function runTask(_id: string | Mongo.ObjectID, time: Date) : Promise<Model.Task[]> {
    var idToRun = toId(_id);
    return getRunning().then((tasks) => {
        var idsToPause: Mongo.ObjectID[] = [];
        var runningTask = null;
        tasks.forEach((task) => {
            if (idToRun.equals(toId(task._id)))
                runningTask = task;
            else
                idsToPause.push(toId(task._id));
        });
        if (idsToPause.length == 0) {
            if (runningTask)
                return [runningTask];

            return startTask(_id, time).then((task) => [task]);
        }
        return pauseRunningTasks(idsToPause, Model.State.PAUSED, time)
            .then((tasks) => startTask(_id, time).then((task) => [task].concat(tasks)));
    });
}

export function completeTask(_id: string | Mongo.ObjectID, time: Date) : Promise<Model.Task> {
    return get(_id).then((task) => {
        switch(task.state) {
            case Model.State.COMPLETED:
                return task;

            case Model.State.RUNNING:
                return pauseRunningTasks([toId(_id)], Model.State.COMPLETED, time).then((tasks) => tasks[0]);
        }
        return update(_id, {
            $set: {
                state: Model.State.COMPLETED,
                completed_time: time
            }
        });
    });
}

export function changeState(_id: string | Mongo.ObjectID, newState: Model.State, time: Date) : Promise<Model.Task[]> {
    switch(newState) {
        case Model.State.PAUSED:
            return pauseTask(_id, time)
                .then((task)=>[task]);
        case Model.State.RUNNING:
            return runTask(_id, time);
        case Model.State.COMPLETED:
            return completeTask(_id, time)
                .then((task)=>[task]);
    }
    return new Promise<Model.Task[]>((resolve, reject) => {
        reject("Unknown state: " + newState);
    });
}
