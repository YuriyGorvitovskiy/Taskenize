import * as Moment from "moment";
import * as Mongo from "mongodb";

import * as Model from "../model/task";
import * as Util from "../util/util";

let  dbTasks: Mongo.Collection  = null;

export function connect(db: Mongo.Db) {
    dbTasks = db.collection("tasks");
    // Add Migration here
}

function toId(id: string | Mongo.ObjectID): Mongo.ObjectID {
    if (typeof id === "string") {
        id = new Mongo.ObjectID(id as string);
    }
    return id as Mongo.ObjectID;
}

function toIds(ids: Array<string | Mongo.ObjectID>): Mongo.ObjectID[] {
    for (let i = 0; i < ids.length; ++i) {
        ids[i] = toId(ids[i]);
    }
    return ids as Mongo.ObjectID[];
}

export function get(id: string | Mongo.ObjectID): Promise<Model.ITask> {
    return dbTasks.find({_id: toId(id)}).next() as Promise<Model.ITask>;
}

export function getMany(ids: Array<string | Mongo.ObjectID>): Promise<Model.ITask[]> {
    return dbTasks.find({_id: {$in: toIds(ids)}}).toArray() as Promise<Model.ITask[]>;
}

export function getAll(query: Model.IQuery): Promise<Model.ITask[]> {
    const filter: any = {
        user_id: query.user_id,
    };
    if (query.state != null) {
        const states = [];
        [].concat(query.state).forEach((state) => states.push(parseInt(state, 10)));
        filter.state = {$in: states};
    }
    if (query.completed_period != null) {
        filter.completed_time = {
            $gte: query.completed_period.begin,
            $lt: query.completed_period.end,
        };
    }
    // console.log("Filter: " + JSON.stringify(filter));
    return dbTasks.find(filter).sort({
        "duration.0.end": -1,
        "scheduled": 1,
    }).toArray() as Promise<Model.ITask[]>;
}

export function getRunning(): Promise<Model.ITask[]> {
    return dbTasks.find({state: Model.State.RUNNING}).toArray() as Promise<Model.ITask[]>;
}

export function insert( userId: string,
                        title: string,
                        subject: string,
                        category: string,
                        context: string,
                        project: string,
                        story: string,
                        scheduled: Date,
                        collapsed: boolean,
                        createdTime: Date): Promise<Model.ITask> {
    const task: Model.ITask = {
        automation:     {behavior: Model.Behavior.NONE},
        category:       category || "",
        collapsed:      collapsed == null ? true : collapsed,
        completed_time: null,
        context:        context || "",
        created_time:   createdTime || null,
        duration:       [],
        project:        project || "",
        scheduled:      scheduled || null,
        state:          Model.State.PAUSED,
        story:          story || "",
        subject:        subject || "",
        title:          title || "",
        user_id:        userId,
    };
    return dbTasks.insertOne(task)
        .then(() => task) as Promise<Model.ITask>;
}

export function copy( task: Model.ITask, scheduled: Date): Promise<Model.ITask> {
    const copyAutomation: Model.IAutomation = {behavior: Model.Behavior.NONE};
    if (task.automation != null && task.automation.behavior === Model.Behavior.REPEAT) {
        copyAutomation.behavior = task.automation.behavior;
        if (task.automation.relatedTaskId != null) {
            copyAutomation.relatedTaskId = task.automation.relatedTaskId;
        }
        if (task.automation.timingKind != null) {
            copyAutomation.timingKind = task.automation.timingKind;
        }
        if (task.automation.timingDuration != null) {
            copyAutomation.timingDuration = task.automation.timingDuration;
        }
        if (task.automation.timingDurationUnit != null) {
            copyAutomation.timingDurationUnit = task.automation.timingDurationUnit;
        }
        if (task.automation.timingAdjustment != null) {
            copyAutomation.timingAdjustment = task.automation.timingAdjustment;
        }
        if (task.automation.timingAdjustmentKind != null) {
            copyAutomation.timingAdjustmentKind = task.automation.timingAdjustmentKind;
        }
    }
    const copyTask: Model.ITask = {
        automation:     copyAutomation,
        category:       task.category || "",
        collapsed:      true,
        completed_time: null,
        context:        task.context || "",
        created_time:   new Date(),
        duration:       [],
        project:        task.project || "",
        scheduled:      scheduled || null,
        state:          Model.State.PAUSED,
        story:          task.story || "",
        subject:        task.subject || "",
        title:          task.title || "",
        user_id:        task.user_id,
    };
    return dbTasks.insertOne(copyTask)
        .then(() => task) as Promise<Model.ITask>;
}

export function update(id: string | Mongo.ObjectID, updateAction: any): Promise<Model.ITask> {
    // console.log("Update: " + JSON.stringify(updateAction));
    return dbTasks.updateOne({_id: toId(id)}, updateAction)
                .then(() => get(id))
                .then((task) => triggerAutomation(task, updateAction));
}

export function updateMany(ids: Array<string | Mongo.ObjectID>, updateAction: any): Promise<Model.ITask[]> {
    return dbTasks.updateMany({_id:  {$in: toIds(ids)}}, updateAction)
                .then(() => getMany(ids))
                .then((tasks) => {
                    const triggers: Array<Promise<Model.ITask>> = [];
                    for (const task of tasks) {
                        triggers.push(triggerAutomation(task, updateAction));
                    }
                    return Promise.all(triggers);
                });
}

export function remove(id: string | Mongo.ObjectID): Promise<Model.ITask> {
    return get(toId(id))
            .then((task) => {
                return dbTasks.deleteOne({_id: toId(id)})
                    .then(() => task);
            });
}

export function removeDuration(id: string | Mongo.ObjectID, index: number): Promise<Model.ITask> {
    return dbTasks.updateOne({_id: toId(id)}, {$unset : {["duration." + index] : 1 }})
            .then(() => dbTasks.updateOne({_id: toId(id)}, {$pull : {duration : null}}))
            .then(() => get(id)) as Promise<Model.ITask>;
}

function pauseRunningTasks(ids: Mongo.ObjectID[], pauseState: Model.State, time: Date): Promise<Model.ITask[]> {
    return updateMany(
        ids,
        {$set: {
            "completed_time":   pauseState === Model.State.COMPLETED ? time || new Date() : null,
            "duration.0.end":   time || new Date(),
            "state":            pauseState,
        }},
    );
}
export function pauseTask(id: string | Mongo.ObjectID, time: Date): Promise<Model.ITask> {
    return get(id).then((task) => {
        switch (task.state) {
            case Model.State.PAUSED:
                return task;

            case Model.State.RUNNING:
                return pauseRunningTasks([toId(id)], Model.State.PAUSED, time).then((tasks) => tasks[0]);
        }
        return update(id, {$set: {
            completed_time: null,
            state: Model.State.PAUSED,
        }});
    });
}

function startTask(id: string | Mongo.ObjectID, time: Date): Promise<Model.ITask> {
    return update(id, {
        $push: {
            duration:  {
                $each: [{begin: time || new Date(), end: null}],
                $position: 0,
            },
        },
        $set: {
            completed_time: null,
            state: Model.State.RUNNING,
        },
    });
}

export function runTask(id: string | Mongo.ObjectID, time: Date): Promise<Model.ITask[]> {
    const idToRun = toId(id);
    return getRunning().then((tasks) => {
        const idsToPause: Mongo.ObjectID[] = [];
        let runningTask = null;
        tasks.forEach((task) => {
            if (idToRun.equals(toId(task._id))) {
                runningTask = task;
            } else {
                idsToPause.push(toId(task._id));
            }
        });
        if (idsToPause.length === 0) {
            if (runningTask) {
                return [runningTask];
            }

            return startTask(id, time).then((task) => [task]);
        }
        return pauseRunningTasks(idsToPause, Model.State.PAUSED, time)
            .then((tsks) => startTask(id, time).then((tsk) => [tsk].concat(tsks)));
    });
}

export function completeTask(id: string | Mongo.ObjectID, time: Date): Promise<Model.ITask> {
    return get(id).then((task) => {
        switch (task.state) {
            case Model.State.COMPLETED:
                return task;

            case Model.State.RUNNING:
                return pauseRunningTasks([toId(id)], Model.State.COMPLETED, time).then((tasks) => tasks[0]);
        }
        return update(id, {
            $set: {
                completed_time: time,
                state: Model.State.COMPLETED,
            },
        });
    });
}

export function changeState(id: string | Mongo.ObjectID, newState: Model.State, time: Date): Promise<Model.ITask[]> {
    switch (newState) {
        case Model.State.PAUSED:
            return pauseTask(id, time)
                .then((task) => [task]);
        case Model.State.RUNNING:
            return runTask(id, time);
        case Model.State.COMPLETED:
            return completeTask(id, time)
                .then((task) => [task]);
    }
    return new Promise<Model.ITask[]>((resolve, reject) => {
        reject("Unknown state: " + newState);
    });
}

export function triggerAutomation(task: Model.ITask, updateScript: any): Promise<Model.ITask> {
    if (task.automation == null || task.automation.behavior === Model.Behavior.NONE) {
        return Promise.resolve(task);
    }
    if (task.automation.behavior === Model.Behavior.REPEAT && updateScript.$set.state === Model.State.COMPLETED) {
        return triggerRepeatAutomation(task);
    } else if (task.automation.behavior === Model.Behavior.FOLLOWED && task.automation.relatedTaskId != null) {
        if (updateScript.$set.completed_time != null) {
            return triggerFollowedAutomation(task, updateScript.$set.completed_time as Date);
        } else if (updateScript.$set.scheduled != null) {
            return triggerFollowedAutomation(task, updateScript.$set.scheduled as Date);
        }
    }
    return Promise.resolve(task);
}

export function triggerRepeatAutomation(task: Model.ITask): Promise<Model.ITask> {
    // console.log("Trigger repeat automation for "" + task.title + """);
    let from = task.completed_time;
    if (task.automation.timingKind === Model.TimingKind.IN && task.scheduled != null) {
        from = task.scheduled;
    }

    return copy(task, calculateTiming(task.automation, from))
                .then(() => update(task._id, {
                        $set: {"automation.behavior": Model.Behavior.NONE},
                    }));
}

export function triggerFollowedAutomation(task: Model.ITask, fromDate: Date): Promise<Model.ITask> {
    return update(task.automation.relatedTaskId, {
        $set: {
            scheduled: calculateTiming(task.automation, fromDate),
        },
    }).then(() => task);
}

export function calculateTiming(automation: Model.IAutomation, fromDate: Date): Date {
    let timing: Moment.Moment = Moment(fromDate);
    if (automation.timingDuration != null && automation.timingDuration > 0 && automation.timingDurationUnit != null) {
        let unit: Moment.unitOfTime.Base = "week";
        switch (automation.timingDurationUnit) {
            case Model.TimingDurationUnit.MINUTE: unit = "minute"; break;
            case Model.TimingDurationUnit.HOUR: unit = "hour"; break;
            case Model.TimingDurationUnit.DAY: unit = "day"; break;
            case Model.TimingDurationUnit.WEEK: unit = "week"; break;
            case Model.TimingDurationUnit.MONTH: unit = "month"; break;
        }
        timing = timing.add(automation.timingDuration, unit);
    }
    if (automation.timingKind === Model.TimingKind.AFTER && automation.timingAdjustmentKind != null) {
        if (automation.timingAdjustmentKind === Model.TimingAdjustmentKind.DAY_OF_THE_MONTH &&
            automation.timingAdjustment != null &&
            automation.timingAdjustment > 0
        ) {
            if (timing.date() > automation.timingAdjustment) {
                timing = timing.add(1, "month");
            }
            timing = timing.date(automation.timingAdjustment);
        } else {
            const isoWeekday = 1 + automation.timingAdjustmentKind - Model.TimingAdjustmentKind.MONDAY;
            if (timing.isoWeekday() > isoWeekday) {
                timing = timing.add(1, "week");
            }
            timing = timing.isoWeekday(isoWeekday);
        }
    }
    return timing.toDate();
}
