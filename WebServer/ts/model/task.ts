import * as Moment from 'moment';

export enum State {
    PAUSED,
    RUNNING,
    COMPLETED
};

export enum Behavior {
    NONE,
    REPEAT,
    FOLLOWED
};

export enum TimingKind {
    IN,
    AFTER
};

export enum TimingDurationUnit {
    DAY,
    WEEK,
    MONTH
}

export enum TimingAdjustmentKind {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY,
    DAY_OF_THE_MONTH
};

export interface Period {
    begin:      Date;
    end?:       Date;
};

export interface Automation {
    behavior:               Behavior;
    relatedTaskId?:         string;
    timingKind?:            TimingKind;
    timingDuration?:        number;
    timingDurationUnit?:    Moment.unitOfTime.Base;
    timingAdjustment?:      number;
    timingAdjustmentKind?:  TimingAdjustmentKind;
}

export interface Task {
    _id?:           string;
    user_id:        string;
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
    automation?:    Automation;
};

export interface Query {
    user_id: string;
    state: State | State[];
    completed_period?: Period;
}
