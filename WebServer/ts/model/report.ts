export const version = "0.0.1";

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
