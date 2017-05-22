import * as $ from 'jquery';
import * as Moment from 'moment';
import * as Report from './report';

import * as Text from '../util/text';

export enum State {
    PAUSED,
    RUNNING,
    COMPLETED
};

export enum Context {
    HOME,
    OFFICE,
    HOBBY,
    SHOPPING,
    INTERTAINMENT
};

export class Category {
    name:       string;
    title:      string;
    glyph:      string;
    css:        string;
    autorun:    boolean;

    constructor(name: string, css: string, glyph: string, autorun: boolean) {
        this.name = name;
        this.title = name;
        this.css = css;
        this.glyph = glyph;
        this.autorun = autorun;
    }
    public static ALL = [
        new Category("House", "warning", "home", false),
        new Category("Office", "danger", "briefcase", false),
        new Category("Education", "warning", "education", false),
        new Category("Shop",  "info", "shopping-cart", false),
        new Category("Hobby", "info", "tower", false),
        new Category("Recreation", "success", "tent", false),
        new Category("Pleasure", "success", "facetime-video", false),
    ];
    public static COMMON = [];
    public static MAP = {};
};
(() => {
    Category.ALL.map((a)=>{Category.MAP[a.name] = a});
    Category.COMMON.push(Category.MAP["House"]);
    Category.COMMON.push(Category.MAP["Office"]);
    Category.COMMON.push(Category.MAP["Shop"]);
    Category.COMMON.push(Category.MAP["Hobby"]);
    Category.COMMON.push(Category.MAP["Recreation"]);
    Category.COMMON.push(Category.MAP["Pleasure"]);
})();

export interface Period {
    begin:      Date;
    end?:       Date;
}

export interface Task {
    _id?:           string;
    state:          State;
    title:          string;
    subject:        string;
    context:        string;
    category:       string;
    project:        string;
    story:          string;
    scheduled:      Date;
    duration:       Period[];
    collapsed:      boolean;
    created_time:   Date;
    completed_time: Date;
}

export function get(id: string) {
    return $.getJSON('/rest/v1/tasks/' + id).then(parseTaskJson);
}

export function getExecuting() {
    var data = {
        state: [State.PAUSED, State.RUNNING]
    };
    return $.getJSON('/rest/v1/tasks', data).then(parseTasksJson);
}

export function getCompleted(period: Period) {
    var data = {
        completed_begin: period.begin,
        completed_end: period.end,
        state: State.COMPLETED
    };

    return $.getJSON('/rest/v1/tasks', data).then(parseTasksJson);
}

export function postNew(task : Task) {
    return $.ajax({
        method: "POST",
        url: '/rest/v1/tasks',
        data: task,
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateState(task: Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {
            state: task.state,
            time: new Date()
        },
        dataType: "json"
    }).then(parseTasksJson);
}

export function updateTitle(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {title: task.title},
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateSubject(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {subject: task.subject},
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateCollapsed(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {collapsed: task.collapsed},
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateContext(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {context: task.context},
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateCategory(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {category: task.category},
        dataType: "json"
    }).then(parseTaskJson)
}

export function updateProject(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {project: task.project},
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateStory(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {story: task.story},
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateScheduled(task : Task) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {scheduled: task.scheduled},
        dataType: "json"
    }).then(parseTaskJson);
}

export function updateDuration(task : Task, index : number, field: string) {
    return $.ajax({
        method: "PUT",
        url: '/rest/v1/tasks/' + task._id,
        data: {["duration." + index + "." +field]: task.duration[index][field]},
        dataType: "json"
    }).then(parseTaskJson);
}

export function deleteDuration(task : Task, index : number) {
    return $.ajax({
        method: "DELETE",
        url: '/rest/v1/tasks/' + task._id + '/duration/' + index,
        dataType: "json"
    }).then(parseTaskJson);
}

export function del(_id: string) {
    return $.ajax({
        method: "DELETE",
        url: '/rest/v1/tasks/' + _id,
        dataType: "json"
    }).then(parseTaskJson);
}

function parseTaskJson(json: any) : Task {
    var task = {
        _id:        json._id,
        state:      json.state,
        title:      json.title || "",
        subject:    json.subject || "",
        context:    json.context || "",
        category:   json.category || "",
        project:    json.project || "",
        story:      json.story || "",
        scheduled:  json.scheduled ? new Date(json.scheduled) : null,
        duration:   [],
        collapsed:  json.collapsed==='true',
        created_time:   json.created_time ? new Date(json.created_time) : null,
        completed_time: json.completed_time ? new Date(json.completed_time) : null,

    }
    if ($.isArray(json.duration)) {
        json.duration.forEach((period) => {
            task.duration.push ({
                begin:  period.begin ? new Date(period.begin) :  null,
                end:    period.end ? new Date(period.end) : null
            });
        });
    }
    return task;
}
function parseTasksJson(json: any) : Task[] {
    var tasks = [];
    if ($.isArray(json)) {
        json.forEach((task) => {
            tasks.push(parseTaskJson(task));
        });
    }
    return tasks;
}

export function calculateDuration(task: Task) : Moment.Duration {
    return task.duration.reduce((prev: Moment.Duration, curr: Period, index, array) : Moment.Duration => {
        var end : Moment.Moment = (curr.end == null ? Moment() : Moment(curr.end));
        var period : Moment.Duration = Moment.duration(end.diff(Moment(curr.begin)));
        return period.add(prev);
    }, Moment.duration(0));
}

export function calculateCompletedDuration(task: Task) : Moment.Duration {
    return task.duration.reduce((prev: Moment.Duration, curr: Period, index, array) : Moment.Duration => {
        if (curr.end == null)
            return prev;

        var period : Moment.Duration = Moment.duration(Moment(curr.end).diff(Moment(curr.begin)));
        return period.add(prev);
    }, Moment.duration(0));
}

export function executionComparator(a: Task, b: Task) : number {
    if (a.state == State.RUNNING) return -1;
    if (b.state == State.RUNNING) return 1;
    var at = a.scheduled == null ? 0 : a.scheduled.getTime();
    var bt = b.scheduled == null ? 0 : b.scheduled.getTime();
    if (at != bt) return at - bt;
    at = a.duration.length == 0 ? 0 : a.duration[0].end == null ? 0 : a.duration[0].end.getTime();
    bt = b.duration.length == 0 ? 0 : b.duration[0].end == null ? 0 : b.duration[0].end.getTime();
    return bt - at;
}

export function getComparator(property: Report.Property) : (a: Task, b: Task) => number {
    var basic = (a: Task, b: Task) => {
        var av = a.title == null ? "" : a.title;
        var bv = b.title == null ? "" : b.title;
        return (av < bv ? -1 : av > bv ? 1 : 0);
    };
    switch(property) {
        case Report.Property.COMPLETED_TIME:
            return (a: Task, b: Task) => {
                var av = a.completed_time == null ? 0 : a.completed_time.getTime();
                var bv = b.completed_time == null ? 0 : b.completed_time.getTime();
                return av == bv ? basic(a,b) : bv - av;
            }
        case Report.Property.CONTEXT:
            return (a: Task, b: Task) => {
                var av = a.context || "";
                var bv = b.context || "";
                return av == bv ? basic(a,b) : av < bv ? -1 : 1;
            }
        case Report.Property.CATEGORY:
            return (a: Task, b: Task) => {
                var av = a.category || "";
                var bv = b.category || "";
                return av == bv ? basic(a,b) : av < bv ? -1 : 1;
            }
        case Report.Property.PROJECT:
            return (a: Task, b: Task) => {
                var av = a.project || "";
                var bv = b.project || "";
                return av == bv ? basic(a,b) : av < bv ? -1 : 1;
            }
        case Report.Property.STORY:
            return (a: Task, b: Task) => {
                var av = a.story || "";
                var bv = b.story || "";
                return av == bv ? basic(a,b) : av < bv ? -1 : 1;
            }
    }
    return basic;
}

export function getGroupNamer(property: Report.Property) : (t: Task) => string {
    switch(property) {
        case Report.Property.COMPLETED_TIME:
            return (t) => Text.formatGroupDay(t.completed_time, true);

        case Report.Property.CONTEXT:
            return (t) => t.context || "No Context";

        case Report.Property.CATEGORY:
            return (t) => t.category || "No Category";

        case Report.Property.PROJECT:
            return (t) => t.project || "No Project";

        case Report.Property.STORY:
            return (t) => t.story || "No Story";
    }
    return (t) => t.title || "No Title";

}
