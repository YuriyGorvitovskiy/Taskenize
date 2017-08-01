import * as Task from "./task";

export interface IRequest {
    begin: Date;
    end: Date;
    group_by: string;
}

export interface IReport {
    title: string;
    duration: number;
    reports: IReport[];
}
