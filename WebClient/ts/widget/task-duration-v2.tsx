import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

class Props {
    task: Model.Task;
}

export class Component extends React.Component<Props, {}> {
    public render() {
        var task = this.props.task || Model.EMPTY_TASK;
        var durations : Model.Period[] = task.duration;
        var sections = [];
        $.each(durations, (index: number, period: Model.Period) => {
            var toPart;
            if (period.end == null) {
                toPart = <input
                        className="tz-to"
                        type="text"
                        value="In progress..."
                        readOnly/>;
            } else {
                toPart = <input
                        className="tz-to"
                        type="datetime-local"
                        step="1"
                        value={TextUtil.formatInputDateTimeLocal(period.end, true)}
                        required/>
            }
            sections.push(
                <section className="tz-period" key={index}>
                    {toPart}
                    <input  className="tz-from"
                            type="datetime-local"
                            step="1"
                            value={TextUtil.formatInputDateTimeLocal(period.begin, true)}
                            required/>
                    <span className="tz-duration">{TextUtil.formatPeriod(period.begin, period.end)}</span>
                    <br/>
                    <a className="tz-action tz-delete" href="#"></a>
                </section>
            );
        });
        return (
            <div className="tz-sidebar tz-task-duration">
                <header>
                    <span className="tz-title">Duration</span>
                    <span className="tz-duration">{TextUtil.formatDuration(Model.calculateDuration(task))}</span>
                </header>
                {sections}
            </div>
        );
    }
}
