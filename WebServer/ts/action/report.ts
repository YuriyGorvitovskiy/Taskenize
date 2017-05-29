import * as Moment from 'moment';
import * as Mongo from 'mongodb';
import * as Model from '../model/report'
import * as ModelTask from '../model/task'
import * as Util from '../router/util'

var  _db  : Mongo.Db          = null;
var  _cl  : Mongo.Collection  = null;

export function connect(db : Mongo.Db) {
    _db = db;
    _cl = db.collection('tasks');
}

function getTasks(user_id: string, request: Model.Request) : Promise<ModelTask.Task[]> {
    return _cl.find({
        user_id: user_id,
        duration: {
            $elemMatch: {
                $or: [
                    { end: {$gt: request.begin} },
                    { end: null }
                ],
                begin: {$lt: request.end}
            }
        }
    }).toArray() as Promise<ModelTask.Task[]>;
}

export function get(user_id: string, request: Model.Request) : Promise<Model.Report[]> {
    var now = new Date().getTime();
    return getTasks(user_id, request)
        .then((tasks) => {
            var grouped : {[key:string] : Model.Report}={};
            var result : Model.Report[] = [];
            for(var i in tasks) {
                var task = tasks[i];
                var duration = Moment.duration();
                for (var i in task.duration) {
                    var begin = Math.max(task.duration[i].begin.getTime(), request.begin.getTime());
                    var end = Math.min(task.duration[i].end ? task.duration[i].end.getTime() : now, request.end.getTime());
                    if (begin < end)
                        duration.add(end-begin, 'ms');
                }
                if (duration.asMilliseconds() > 0) {
                    var subReport : Model.Report = {
                        title: task.title,
                        duration: duration.asMilliseconds(),
                        reports: []
                    };
                    var key = task[request.group_by] ? task[request.group_by] : "" ;
                    if (grouped[key] == null) {
                        grouped[key] = {
                            title: key,
                            duration: 0,
                            reports: []
                        }
                        result.push(grouped[key]);
                    }
                    grouped[key].duration += subReport.duration;
                    grouped[key].reports.push(subReport);
                }
            }
            return result;
        });
}
