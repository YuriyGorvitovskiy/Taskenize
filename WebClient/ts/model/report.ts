import * as $ from "jquery";
import * as Moment from "moment";
import * as Task from "./task";

export enum Anchor {
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
    COMPLETED_TIME,
}

const rangeToUnitOfTime: {[key: number]: Moment.unitOfTime.DurationConstructor} = {};
rangeToUnitOfTime[Range.DAY] = "day";
rangeToUnitOfTime[Range.WEEK] = "week";
rangeToUnitOfTime[Range.MONTH] = "month";

const rangeToUnitsOfTime: {[key: number]: Moment.unitOfTime.DurationConstructor} = {};
rangeToUnitsOfTime[Range.DAY] = "days";
rangeToUnitsOfTime[Range.WEEK] = "weeks";
rangeToUnitsOfTime[Range.MONTH] = "months";

const propertyToRequestNames: {[key: number]: string} = {};
propertyToRequestNames[Property.CONTEXT] = "context";
propertyToRequestNames[Property.CATEGORY] = "category";
propertyToRequestNames[Property.PROJECT] = "project";
propertyToRequestNames[Property.STORY] = "story";
propertyToRequestNames[Property.TASK] = "title";
propertyToRequestNames[Property.COMPLETED_TIME] = "completed_time";

export interface IReport {
    title: string;
    duration: Moment.Duration;
    reports: IReport[];
}

interface IRequest {
    period: Task.IPeriod;
    group_by: string;
}

export function calculatePeriod(anchor: Anchor, range: Range): Task.IPeriod {
    const now = Moment();
    const unitOfTime: Moment.unitOfTime.DurationConstructor = rangeToUnitOfTime[range];
    const unitsOfTime: Moment.unitOfTime.DurationConstructor = rangeToUnitsOfTime[range];
    switch (anchor) {
        case Anchor.NOW:
            return {
                begin: Moment(now).subtract(unitsOfTime, 1).toDate(),
                end: now.toDate(),
            };
        case Anchor.CURRENT:
            return {
                begin: Moment(now).startOf(unitOfTime).toDate(),
                end: Moment(now).add(unitsOfTime, 1).startOf(unitOfTime).toDate(),
            };
        case Anchor.LAST:
            return {
                begin: Moment(now).startOf(unitOfTime).subtract(unitsOfTime, 1).toDate(),
                end: Moment(now).startOf(unitOfTime).toDate(),
            };
    }
    return null;
}

export function get(period: Task.IPeriod, groupBy: Property) {
    const data = {
        begin: period.begin,
        end: period.end,
        group_by: propertyToRequestNames[groupBy],
    };

    return $.getJSON("/rest/v1/report/", data).then(parseReportJson);
}

function parseReportJson(json: any[]): IReport[] {
    const reports: IReport[] = [];
    $.each(json, (index: number, sub: any) => {
        reports.push({
           duration: Moment.duration(sub.duration),
           reports: parseReportJson(sub.reports),
           title: sub.title,
       });
    });
    return reports;
}

export function reportComparator(a: IReport, b: IReport): number {
    const diff = a.duration.asMilliseconds() - b.duration.asMilliseconds();
    if (diff !== 0) {
        return -diff; // descending order
    }

    if (a.title < b.title) {
        return -1;
    }
    if (a.title > b.title) {
        return 1;
    }
    return 0;
}

export function sort(reports: IReport[], comporator: (a: IReport, b: IReport) => number ) {
    reports.sort(comporator);
    $.each(reports, (i, r) => sort(r.reports, comporator));
}
