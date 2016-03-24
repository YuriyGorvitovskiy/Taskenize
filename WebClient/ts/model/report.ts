import * as $ from 'jquery';
import * as Moment from 'moment';
import * as Task from './task';

export enum Ancor {
    NOW,
    CURRENT,
    LAST,
}

export enum Range {
    DAY,
    WEEK,
    MONTH,
}

export enum Property {
    CONTEXT,
    CATEGORY,
    PROJECT,
    STORY,
    TASK,
}

const rangeToUnitOfTime : {[key:number]: string} = {};
rangeToUnitOfTime[Range.DAY] = 'day';
rangeToUnitOfTime[Range.WEEK] = 'week';
rangeToUnitOfTime[Range.MONTH] = 'month';

const rangeToUnitsOfTime : {[key:number]: string} = {};
rangeToUnitsOfTime[Range.DAY] = 'days';
rangeToUnitsOfTime[Range.WEEK] = 'weeks';
rangeToUnitsOfTime[Range.MONTH] = 'months';

const propertyToRequestNames : {[key:number]: string} = {};
propertyToRequestNames[Property.CONTEXT] = 'context';
propertyToRequestNames[Property.CATEGORY] = 'category';
propertyToRequestNames[Property.PROJECT] = 'project';
propertyToRequestNames[Property.STORY] = 'story';
propertyToRequestNames[Property.TASK] = 'task';

export interface Report {
    title:      string;
    duration:   Moment.Duration;
    reports:    Report[];
};

interface Request {
    period: Task.Period;
    group_by:  string;
}

export function calculatePeriod(ancor: Ancor, range: Range) : Task.Period {
    var now = Moment();
    var unitOfTime: string = rangeToUnitOfTime[range];
    var unitsOfTime: string = rangeToUnitsOfTime[range];
    switch(ancor) {
        case Ancor.NOW:
            return {
                begin: Moment(now).subtract(1, unitsOfTime).toDate(),
                end: now.toDate()
            };
        case Ancor.CURRENT:
            return {
                begin: Moment(now).startOf(unitOfTime).toDate(),
                end: Moment(now).add(1, unitsOfTime).startOf(unitOfTime).toDate()
            };
        case Ancor.LAST:
            return {
                begin: Moment(now).startOf(unitOfTime).subtract(1, unitsOfTime).toDate(),
                end: Moment(now).startOf(unitOfTime).toDate()
            };
    }
    return null;
}

export function get(period: Task.Period, group_by: Property) {
    var data: Request = {
        period: period,
        group_by: propertyToRequestNames[group_by]
    };

    return $.getJSON('/rest/v1/report/',data).then(parseReportJson);
}

function parseReportJson(json: any) : Report {
    var report : Report = {
        title:      json.title,
        duration:   Moment.duration(json.duration),
        reports:    []
    };
    $.each(json.reports, (index: number, sub: any) => {
        report.reports.push(parseReportJson(sub));
    });
    return report;
}

export function reportComparator(a: Report, b: Report) : number {
    var diff = a.duration.asMilliseconds() - b.duration.asMilliseconds();
    if (diff != 0)
        return diff;

    if (a.title < b.title)
        return -1;
    if (a.title < b.title)
        return 1;
    return 0;
}

export function sort(report: Report, comporator: (a: Report, b: Report) => number ) {
    report.reports.sort(comporator);
    $.each(report.reports, (i, r) => sort(r, comporator));
}
