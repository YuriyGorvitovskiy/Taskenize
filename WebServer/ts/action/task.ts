import * as Mongo from 'mongodb';
import * as Moment from 'moment';
import * as Model from '../model/task'
import * as Util from '../router/util'

var  _db  : Mongo.Db          = null;
var  _cl  : Mongo.Collection  = null;

export function connect(db : Mongo.Db) {
    _db = db;
    _cl = db.collection('tasks');

    //Add Migration here
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
    return _cl.find({_id: toId(_id)}).next() as Promise<Model.Task>;
}

export function getMany(_ids: (string | Mongo.ObjectID)[]) : Promise<Model.Task[]> {
    return _cl.find({_id: {$in: toIds(_ids)}}).toArray() as Promise<Model.Task[]>;
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
    }).toArray() as Promise<Model.Task[]>;
}

export function getRunning() : Promise<Model.Task[]> {
    return _cl.find({state: Model.State.RUNNING}).toArray() as Promise<Model.Task[]>;
}

export function insert( user_id:        string,
                        title:          string,
                        subject:        string,
                        category:       string,
                        context:        string,
                        project:        string,
                        story:          string,
                        scheduled:      Date,
                        collapsed:      boolean,
                        created_time:   Date) : Promise<Model.Task> {
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
        completed_time: null,
        automation: {behavior: Model.Behavior.NONE}
    };
    return _cl.insertOne(task)
        .then(() => task) as Promise<Model.Task>;
}

export function copy( task: Model.Task, scheduled: Date) : Promise<Model.Task> {
    var copyAutomation : Model.Automation = {behavior: Model.Behavior.NONE};
    if (task.automation != null && task.automation.behavior == Model.Behavior.REPEAT) {
        copyAutomation.behavior = task.automation.behavior;
        copyAutomation.relatedTaskId = task.automation.relatedTaskId || null;
        copyAutomation.timingKind = task.automation.timingKind || null;
        copyAutomation.timingDuration = task.automation.timingDuration || null;
        copyAutomation.timingDurationUnit = task.automation.timingDurationUnit || null;
        copyAutomation.timingAdjustment = task.automation.timingAdjustment || null;
        copyAutomation.timingAdjustmentKind = task.automation.timingAdjustmentKind || null;
    }
    let copyTask : Model.Task = {
        user_id:   task.user_id,
        state:     Model.State.PAUSED,
        title:     task.title || "",
        subject:   task.subject || "",
        category:  task.category || "",
        context:   task.context || "",
        project:   task.project || "",
        story:     task.story || "",
        scheduled: scheduled || null,
        duration:  [],
        collapsed: true,
        created_time: new Date(),
        completed_time: null,
        automation: copyAutomation
    };
    return _cl.insertOne(task)
        .then(() => task) as Promise<Model.Task>;
}

export function update(_id: string | Mongo.ObjectID, update: any) : Promise<Model.Task> {
    return _cl.updateOne({_id: toId(_id)}, update)
                .then(() => get(_id))
                .then((task) => triggerAutomation(task, update));
}

export function updateMany(_ids: (string | Mongo.ObjectID)[], update: any) : Promise<Model.Task[]> {
    return _cl.updateMany({_id:  {$in: toIds(_ids)}}, update)
                .then(() => getMany(_ids))
                .then((tasks) => {
                    let triggers: Promise<Model.Task>[] = [];
                    for (const task of tasks) {
                        triggers.push(triggerAutomation(task, update));
                    }
                    return Promise.all(triggers)
                });
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
            .then(() => get(_id)) as Promise<Model.Task>;
}

function pauseRunningTasks(_ids: Mongo.ObjectID[], pauseState: Model.State, time: Date) : Promise<Model.Task[]> {
    return updateMany(
        _ids,
        {$set: {
            state:              pauseState,
            'duration.0.end':   time || new Date(),
            completed_time:     pauseState == Model.State.COMPLETED ? time || new Date() : null
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

export function triggerAutomation(task: Model.Task, updateScript: any) : Promise<Model.Task> {
    if (task.automation == null || task.automation.behavior == Model.Behavior.NONE) {
        return Promise.resolve(task);
    }
    if (task.automation.behavior == Model.Behavior.REPEAT && updateScript.$set.state === Model.State.COMPLETED) {
        return triggerRepeatAutomation(task);
    } else if (task.automation.behavior == Model.Behavior.FOLLOWED && task.automation.relatedTaskId != null) {
        if (updateScript.$set.completed_time != null) {
            return triggerFollowedAutomation(task, updateScript.$set.completed_time as Date);
        } else if (updateScript.$set.scheduled != null) {
            return triggerFollowedAutomation(task, updateScript.$set.scheduled as Date);
        }
    }
    return Promise.resolve(task);
}

export function triggerRepeatAutomation(task: Model.Task) : Promise<Model.Task> {
    return copy(task, calculateTiming(task.automation, task.completed_time))
                .then(() => update(task._id, {
                        $set:{"automation.behavior": Model.Behavior.NONE}
                    }));
}

export function triggerFollowedAutomation(task: Model.Task, fromDate: Date) : Promise<Model.Task> {
    return update(task.automation.relatedTaskId, {
        $set: {
            scheduled: calculateTiming(task.automation, fromDate)
        }
    }).then(() => task);
}

export function calculateTiming(automation: Model.Automation, fromDate: Date) : Date {
    let timing: Moment.Moment = Moment(fromDate);
    if (automation.timingDuration != null && automation.timingDuration > 0 && automation.timingDurationUnit != null) {
        timing = timing.add(automation.timingDuration, automation.timingDurationUnit)
    }
    if (automation.timingKind == Model.TimingKind.AFTER && automation.timingAdjustmentKind != null) {
        if (automation.timingAdjustmentKind == Model.TimingAdjustmentKind.DAY_OF_THE_MONTH && automation.timingAdjustment != null && automation.timingAdjustment > 0) {
            if (timing.date() > automation.timingAdjustment) {
                timing = timing.add(1, 'month');
            }
            timing = timing.date(automation.timingAdjustment);
        } else {
            let isoWeekday = 1 + automation.timingAdjustmentKind - Model.TimingAdjustmentKind.MONDAY;
            if (timing.isoWeekday() > isoWeekday) {
                timing = timing.add(1, 'week');
            }
            timing = timing.isoWeekday(isoWeekday);
        }
    }
    return timing.toDate();
}
