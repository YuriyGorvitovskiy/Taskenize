import * as Mongo from 'mongodb';
import * as Model from '../model/task'
import * as Util from '../router/util'

var  _db  : Mongo.Db          = null;
var  _cl  : Mongo.Collection  = null;

export function connect(db : Mongo.Db) {
    _db = db;
    _cl = db.collection('tasks');
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

export function getAll() : Promise<Model.Task[]> {
    return _cl.find({
        state: {$in: [Model.State.RUNNING, Model.State.PAUSED]}
    }).sort({
        state: -1,
        'duration.0.end': -1
    }).toArray();
}

export function getRunning() : Promise<Model.Task[]> {
    return _cl.find({state: Model.State.RUNNING}).toArray();
}

export function insert( title:      string,
                        subject:    string,
                        context:    string,
                        category:   string,
                        project:    string,
                        story:      string,
                        scheduled:  Date,
                        collapsed:  boolean) : Promise<Model.Task> {
    var task : Model.Task = {
        state:     Model.State.PAUSED,
        title:     title || "",
        subject:   subject || "",
        context:   context || "",
        category:  category || "",
        project:   project || "",
        story:     story || "",
        scheduled: scheduled || null,
        duration:  [],
        collapsed: collapsed == null ? true : collapsed
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

function pauseRunningTasks(_ids: Mongo.ObjectID[], pauseState: Model.State) : Promise<Model.Task[]> {
    return updateMany(
        _ids,
        {$set: {
            state:              pauseState,
            'duration.0.end':   new Date()
        }}
    );
}
export function pauseTask(_id: string | Mongo.ObjectID) : Promise<Model.Task> {
    return get(_id).then((task) => {
        switch(task.state) {
            case Model.State.PAUSED:
                return task;

            case Model.State.RUNNING:
                return pauseRunningTasks([toId(_id)], Model.State.PAUSED).then((tasks) => tasks[0]);
        }
        return update(_id, {$set: {state: Model.State.PAUSED}});
    });
}

function startTask(_id: string | Mongo.ObjectID) : Promise<Model.Task> {
    return update(_id, {
        $set: {state: Model.State.RUNNING},
        $push:{'duration':  { $each: [{begin: new Date(), end: null}], $position: 0}}
    })
}

export function runTask(_id: string | Mongo.ObjectID) : Promise<Model.Task[]> {
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

            return startTask(_id).then((task) => [task]);
        }
        return pauseRunningTasks(idsToPause, Model.State.PAUSED)
            .then((tasks) => startTask(_id).then((task) => [task].concat(tasks)));
    });
}

export function completeTask(_id: string | Mongo.ObjectID) : Promise<Model.Task> {
    return get(_id).then((task) => {
        switch(task.state) {
            case Model.State.COMPLETED:
                return task;

            case Model.State.RUNNING:
                return pauseRunningTasks([toId(_id)], Model.State.COMPLETED).then((tasks) => task[0]);
        }
        return update(_id, {$set: {state: Model.State.COMPLETED}});
    });
}

export function changeState(_id: string | Mongo.ObjectID, newState: Model.State) : Promise<Model.Task[]> {
    switch(newState) {
        case Model.State.PAUSED:
            return pauseTask(_id)
                .then((task)=>[task]);
        case Model.State.RUNNING:
            return runTask(_id);
        case Model.State.COMPLETED:
            return completeTask(_id)
                .then((task)=>[task]);
    }
    return new Promise<Model.Task[]>((resolve, reject) => {
        reject("Unknown state: " + newState);
    });
}
