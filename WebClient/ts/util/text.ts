import * as Moment from "moment";

export function startWith(str: string, prefix: string): boolean {
    return str.substr(0, prefix.length) === prefix;
}

export function pad0(str: any, digits: number): string {
    let s = str.toString();
    for (let i = s.length; i < digits; ++i) {
        s = "0" + s;
    }
    return s;
}

export function formatGroupDay(date: Date, emptyIsToday: boolean): string {
    if (date == null) {
        return emptyIsToday ? "Today" : "";
    }

    const dayAfterTommorow = Moment().add(2, "days").startOf("day");
    const tommorow = Moment().add(1, "days").startOf("day");
    const today = Moment().startOf("day");
    const yesterday = Moment().add(-1, "days").startOf("day");

    const moment = Moment(date);
    if (moment.isBetween(today, tommorow)) {
        return "Today";
    }

    if (moment.isBetween(yesterday, today)) {
        return "Yesterday";
    }

    if (moment.isBetween(tommorow, dayAfterTommorow)) {
        return "Tomorrow";
    }

    return moment.format("ddd D MMMM");
}

export function formatInputDateTimeLocal(date: Date, withSecs: boolean): string {
    if (date == null) {
        return "";
    }
    return Moment(date).format("YYYY-MM-DDTHH:mm" + (withSecs ? ":ss" : ""));
}

export function formatDate(date: Date, withSecs: boolean): string {
    if (date == null) {
        return "";
    }
    return Moment(date).format("ddd YYYY/MM/DD HH:mm" + (withSecs ? ":ss" : ""));
}

export function parseDate(input: string): Date {
    if (input.trim() === "") {
        return null;
    }
    return Moment(input, "YYYY/MM/DD HH:mm:ss").toDate();
}

export function formatPeriod(from: Date, to: Date): string {
    const duration = Moment.duration(Moment(to).diff(Moment(from)));
    return formatDuration(duration);
}

export function formatDuration(duration: Moment.Duration): string {
    if (duration.asSeconds() < 0) {
        duration = Moment.duration(0, "seconds");
    }

    const sec = duration.seconds();
    const min = duration.minutes();
    const hr = Math.floor(duration.asHours());

    return hr + ":" + pad0(min, 2) + ":" + pad0(sec, 2);
}
