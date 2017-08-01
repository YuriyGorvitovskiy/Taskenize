import * as Moment from "moment";
import * as Mongo from "mongodb";
import * as Model from "../model/report";
import * as ModelTask from "../model/task";
import * as Util from "../router/util";

let  dbTasks: Mongo.Collection  = null;

export function connect(db: Mongo.Db) {
    dbTasks = db.collection("tasks");
}

function getTasks(userId: string, request: Model.IRequest): Promise<ModelTask.ITask[]> {
    return dbTasks.find({
        duration: {
            $elemMatch: {
                $or: [
                    { end: {$gt: request.begin} },
                    { end: null },
                ],
                begin: {$lt: request.end},
            },
        },
        user_id: userId,
    }).toArray() as Promise<ModelTask.ITask[]>;
}

export function get(userId: string, request: Model.IRequest): Promise<Model.IReport[]> {
    const now = new Date().getTime();
    return getTasks(userId, request)
        .then((tasks) => {
            const grouped: {[key: string]: Model.IReport} = {};
            const result: Model.IReport[] = [];
            for (const task of tasks) {
                const duration = Moment.duration();
                for (const dur of task.duration) {
                    const begin = Math.max(dur.begin.getTime(), request.begin.getTime());
                    const end = Math.min(dur.end ? dur.end.getTime() : now, request.end.getTime());
                    if (begin < end) {
                        duration.add(end - begin, "ms");
                    }
                }
                if (duration.asMilliseconds() > 0) {
                    const subReport: Model.IReport = {
                        duration: duration.asMilliseconds(),
                        reports: [],
                        title: task.title,
                    };
                    const key = task[request.group_by] ? task[request.group_by] : "" ;
                    if (grouped[key] == null) {
                        grouped[key] = {
                            duration: 0,
                            reports: [],
                            title: key,
                        };
                        result.push(grouped[key]);
                    }
                    grouped[key].duration += subReport.duration;
                    grouped[key].reports.push(subReport);
                }
            }
            return result;
        });
}
