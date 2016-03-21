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
};
