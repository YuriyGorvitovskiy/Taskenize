export enum State {
    PAUSED,
    RUNNING,
    COMPLETED
};

export interface Period {
    begin:      Date;
    end?:       Date;
};

export interface Task {
    _id?:       string;
    user_id:    string;
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
    created_time:   Date;
    completed_time: Date;
};

export interface Query {
    user_id: string;
    state: State | State[];
    completed_period?: Period;
}
