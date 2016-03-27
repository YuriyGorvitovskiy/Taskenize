import * as Task from './task';

export interface Request {
    begin: Date;
    end: Date;
    group_by:  string;
}

export interface Report {
    title:      string;
    duration:   number;
    reports:    Report[];
};
