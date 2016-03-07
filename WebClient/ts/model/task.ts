import * as $ from 'jquery';
import * as Moment from 'moment';

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
    prefix:     string;
    css:        string;
    autorun:    boolean;

    constructor(name: string, css: string, autorun: boolean) {
        this.name = name;
        this.prefix = name + ":";
        this.css = css;
        this.autorun = autorun;
    }

    public static ALL = [
        new Category("Task", "default", false),
        new Category("Duty", "default", false),
        new Category("Metting", "success", false),
        new Category("Training", "info", true),
        new Category("Help", "warning", true),
        new Category("Support", "danger", true)
    ];
};

export interface Period {
    begin:      Date;
    end?:       Date;
}

export interface Task {
    _id?:       string;
    state:      State;
    title:      string;
    subject:    string;
    context:    string;
    category:   string;
    project:    string;
    story:      string;
    scheduled:  Date;
    duration:   Period[];
    collapsed:  boolean;
}

export function get(id: string) {
    return $.getJSON('/rest/v1/tasks/' + id).then(parseTaskJson);
}

export function getAll() {
    return $.getJSON('/rest/v1/tasks').then(parseTasksJson);
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
        data: {state: task.state},
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
        title:      json.title,
        subject:    json.subject,
        context:    json.context,
        category:   json.category,
        project:    json.project,
        story:      json.story,
        scheduled:  json.scheduled ? new Date(json.scheduled) : null,
        duration:   [],
        collapsed:  json.collapsed==='true'
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
