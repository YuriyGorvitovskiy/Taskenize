import * as $ from "jquery";
import * as Moment from "moment";
import * as Report from "./report";

import * as Text from "../util/text";

export enum State {
    PAUSED,
    RUNNING,
    COMPLETED,
}

export enum Context {
    HOME,
    OFFICE,
    HOBBY,
    SHOPPING,
    INTERTAINMENT,
}

export class Category {
    public static ALL = [
        new Category("House", "warning", "home", false),
        new Category("Office", "danger", "briefcase", false),
        new Category("Education", "warning", "education", false),
        new Category("Shop",  "info", "shopping-cart", false),
        new Category("Hobby", "info", "tower", false),
        new Category("Recreation", "success", "tent", false),
        new Category("Pleasure", "success", "facetime-video", false),
    ];
    public static COMMON: Category[] = [];
    public static MAP: {[key: string]: Category} = {};

    public name: string;
    public title: string;
    public glyph: string;
    public css: string;
    public autorun: boolean;

    constructor(name: string, css: string, glyph: string, autorun: boolean) {
        this.name = name;
        this.title = name;
        this.css = css;
        this.glyph = glyph;
        this.autorun = autorun;
    }
}

(() => {
    Category.ALL.map((a) => Category.MAP[a.name] = a);
    [
        "House",
        "Office",
        "Shop",
        "Hobby",
        "Recreation",
        "Pleasure",
    ].map((name) => Category.COMMON.push(Category.MAP[name]));
})();

export interface IPeriod {
    begin: Date;
    end?: Date;
}

export enum Behavior {
    NONE,
    REPEAT,
    FOLLOWED,
}

export enum TimingKind {
    IN,
    AFTER,
}

export enum TimingDurationUnit {
    MINUTE,
    HOUR,
    DAY,
    WEEK,
    MONTH,
}

export enum TimingAdjustmentKind {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY,
    DAY_OF_THE_MONTH,
}

export interface IAutomation {
    behavior: Behavior;
    relatedTaskId?: string;
    timingKind?: TimingKind;
    timingDuration?: number;
    timingDurationUnit?: TimingDurationUnit;
    timingAdjustment?: number;
    timingAdjustmentKind?: TimingAdjustmentKind;
}

export interface ITask {
    _id?: string;
    state: State;
    title: string;
    subject: string;
    context: string;
    category: string;
    project: string;
    story: string;
    scheduled: Date;
    duration: IPeriod[];
    collapsed: boolean;
    created_time: Date;
    completed_time: Date;
    automation?: IAutomation;
}

export function get(id: string) {
    return $.getJSON("/rest/v1/tasks/" + id).then(parseTaskJson);
}

export function getExecuting() {
    const data = {
        state: [State.PAUSED, State.RUNNING],
    };
    return $.getJSON("/rest/v1/tasks", data).then(parseTasksJson);
}

export function getCompleted(period: IPeriod) {
    const data = {
        completed_begin: period.begin,
        completed_end: period.end,
        state: State.COMPLETED,
    };

    return $.getJSON("/rest/v1/tasks", data).then(parseTasksJson);
}

export function postNew(task: ITask) {
    return $.ajax({
        data: task,
        dataType: "json",
        method: "POST",
        url: "/rest/v1/tasks",
    }).then(parseTaskJson);
}

export function updateState(task: ITask) {
    return $.ajax({
        data: {
            state: task.state,
            time: new Date(),
        },
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTasksJson);
}

export function updateTitle(task: ITask) {
    return $.ajax({
        data: {title: task.title},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateSubject(task: ITask) {
    return $.ajax({
        data: {subject: task.subject},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateCollapsed(task: ITask) {
    return $.ajax({
        data: {collapsed: task.collapsed},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateContext(task: ITask) {
    return $.ajax({
        data: {context: task.context},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateCategory(task: ITask) {
    return $.ajax({
        data: {category: task.category},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateProject(task: ITask) {
    return $.ajax({
        data: {project: task.project},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateStory(task: ITask) {
    return $.ajax({
        data: {story: task.story},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateScheduled(task: ITask) {
    return $.ajax({
        data: {scheduled: task.scheduled},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateAutomation(task: ITask) {
    return $.ajax({
        data: {
            "automation.behavior": task.automation.behavior,
            "automation.relatedTaskId": task.automation.relatedTaskId,
            "automation.timingAdjustment": task.automation.timingAdjustment,
            "automation.timingAdjustmentKind": task.automation.timingAdjustmentKind,
            "automation.timingDuration": task.automation.timingDuration,
            "automation.timingDurationUnit": task.automation.timingDurationUnit,
            "automation.timingKind": task.automation.timingKind,
        },
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function updateDuration(task: ITask, index: number, field: string) {
    return $.ajax({
        data: {["duration." + index + "." + field]: task.duration[index][field]},
        dataType: "json",
        method: "PUT",
        url: "/rest/v1/tasks/" + task._id,
    }).then(parseTaskJson);
}

export function deleteDuration(task: ITask, index: number) {
    return $.ajax({
        dataType: "json",
        method: "DELETE",
        url: "/rest/v1/tasks/" + task._id + "/duration/" + index,
    }).then(parseTaskJson);
}

export function del(id: string) {
    return $.ajax({
        dataType: "json",
        method: "DELETE",
        url: "/rest/v1/tasks/" + id,
    }).then(parseTaskJson);
}

function parseTaskJson(json: any): ITask {
    const task = {
        _id: json._id,
        automation: json.automation == null ?
            {
                behavior: Behavior.NONE,
            } : {
                behavior: json.automation.behavior,
                relatedTaskId: json.automation.relatedTaskId,
                timingAdjustment: json.automation.timingAdjustment,
                timingAdjustmentKind: json.automation.timingAdjustmentKind,
                timingDuration: json.automation.timingDuration,
                timingDurationUnit: json.automation.timingDurationUnit,
                timingKind: json.automation.timingKind,
            },
        category: json.category || "",
        collapsed: json.collapsed === "true",
        completed_time: json.completed_time ? new Date(json.completed_time) : null,
        context: json.context || "",
        created_time: json.created_time ? new Date(json.created_time) : null,
        duration: [],
        project: json.project || "",
        scheduled: json.scheduled ? new Date(json.scheduled) : null,
        state: json.state,
        story: json.story || "",
        subject: json.subject || "",
        title: json.title || "",
    };

    if ($.isArray(json.duration)) {
        json.duration.forEach((period) => {
            task.duration.push ({
                begin: period.begin ? new Date(period.begin) : null,
                end: period.end ? new Date(period.end) : null,
            });
        });
    }
    return task;
}

function parseTasksJson(json: any): ITask[] {
    const tasks = [];
    if ($.isArray(json)) {
        json.forEach((task) => {
            tasks.push(parseTaskJson(task));
        });
    }
    return tasks;
}

export function calculateDuration(task: ITask): Moment.Duration {
    return task.duration.reduce((prev: Moment.Duration, curr: IPeriod, index, array): Moment.Duration => {
        const end: Moment.Moment = (curr.end == null ? Moment() : Moment(curr.end));
        const period: Moment.Duration = Moment.duration(end.diff(Moment(curr.begin)));
        return period.add(prev);
    }, Moment.duration(0));
}

export function calculateCompletedDuration(task: ITask): Moment.Duration {
    return task.duration.reduce((prev: Moment.Duration, curr: IPeriod, index, array): Moment.Duration => {
        if (curr.end == null) {
            return prev;
        }

        const period: Moment.Duration = Moment.duration(Moment(curr.end).diff(Moment(curr.begin)));
        return period.add(prev);
    }, Moment.duration(0));
}

export function executionComparator(a: ITask, b: ITask): number {
    if (a.state === State.RUNNING) { return -1; }
    if (b.state === State.RUNNING) { return 1; }
    let at = a.scheduled == null ? 0 : a.scheduled.getTime();
    let bt = b.scheduled == null ? 0 : b.scheduled.getTime();
    if (at !== bt) { return at - bt; }
    at = a.duration.length === 0 ? 0 : a.duration[0].end == null ? 0 : a.duration[0].end.getTime();
    bt = b.duration.length === 0 ? 0 : b.duration[0].end == null ? 0 : b.duration[0].end.getTime();
    return bt - at;
}

export function getComparator(property: Report.Property): (a: ITask, b: ITask) => number {
    const basic = (a: ITask, b: ITask) => {
        const av = a.title == null ? "" : a.title;
        const bv = b.title == null ? "" : b.title;
        return (av < bv ? -1 : av > bv ? 1 : 0);
    };
    switch (property) {
        case Report.Property.COMPLETED_TIME: return (a: ITask, b: ITask) => {
                const av = a.completed_time == null ? 0 : a.completed_time.getTime();
                const bv = b.completed_time == null ? 0 : b.completed_time.getTime();
                return av === bv ? basic(a, b) : bv - av;
            };
        case Report.Property.CONTEXT: return (a: ITask, b: ITask) => {
                const av = a.context || "";
                const bv = b.context || "";
                return av === bv ? basic(a, b) : av < bv ? -1 : 1;
            };
        case Report.Property.CATEGORY: return (a: ITask, b: ITask) => {
                const av = a.category || "";
                const bv = b.category || "";
                return av === bv ? basic(a, b) : av < bv ? -1 : 1;
            };
        case Report.Property.PROJECT: return (a: ITask, b: ITask) => {
                const av = a.project || "";
                const bv = b.project || "";
                return av === bv ? basic(a, b) : av < bv ? -1 : 1;
            };
        case Report.Property.STORY: return (a: ITask, b: ITask) => {
                const av = a.story || "";
                const bv = b.story || "";
                return av === bv ? basic(a, b) : av < bv ? -1 : 1;
            };
    }
    return basic;
}

export function getGroupNamer(property: Report.Property): (t: ITask) => string {
    switch (property) {
        case Report.Property.COMPLETED_TIME: return (t) => Text.formatGroupDay(t.completed_time, true);

        case Report.Property.CONTEXT: return (t) => t.context || "No Context";

        case Report.Property.CATEGORY: return (t) => t.category || "No Category";

        case Report.Property.PROJECT: return (t) => t.project || "No Project";

        case Report.Property.STORY: return (t) => t.story || "No Story";
    }
    return (t) => t.title || "No Title";

}

export function findTaskIndex(tasks: ITask[], taskToFind: ITask): number {
    for (let index = 0; index < tasks.length; ++index) {
        if (taskToFind._id === tasks[index]._id) {
            return index;
        }
    }
    return -1;
}

export function insertAfterTask(tasks: ITask[], taskToFind: ITask, taskToInsert): ITask[] {
    const index = findTaskIndex(tasks, taskToFind);
    if (index < 0) {
        return [taskToInsert].concat(tasks);
    }

    return tasks.slice(0, index + 1).concat(taskToInsert).concat(tasks.slice(index + 1));
}
