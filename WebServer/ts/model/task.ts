import * as Moment from "moment";

export enum State {
    PAUSED,
    RUNNING,
    COMPLETED,
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

export interface IPeriod {
    begin: Date;
    end?: Date;
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
    user_id: string;
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

export interface IQuery {
    user_id: string;
    state: State | State[];
    completed_period?: IPeriod;
}
