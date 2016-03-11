import * as Moment from 'moment';

export function startWith(str: string, prefix: string) : boolean {
    return str.substr(0, prefix.length) == prefix;
}

export function pad0(str: any, digits : number) : string {
    var s = str.toString();
    for (var i = s.length; i < digits; ++i)
        s = '0' + s;
    return s;
}

export function formatDate(date : Date, withSecs: boolean) : string {
    if (date == null)
        return '';
    return Moment(date).format('ddd YYYY/MM/DD HH:mm' + (withSecs ? ':ss' : ''));
};

export function parseDate(input : string) : Date {
    if (input.trim() == '')
        return null;
    return Moment(input, 'YYYY/MM/DD HH:mm:ss').toDate();
};

export function formatPeriod(from : Date, to : Date) : string {
    var duration = Moment.duration(Moment(to).diff(Moment(from)));
    return formatDuration(duration);
}

export function formatDuration(duration : Moment.Duration) : string {
    if (duration.asSeconds() < 0)
        duration = Moment.duration(0, 'seconds');
        
    var sec = duration.seconds();
    var min = duration.minutes();
    var hr = Math.floor(duration.asHours());

    return hr + ":" + pad0(min, 2) + ":" + pad0(sec, 2);
}
