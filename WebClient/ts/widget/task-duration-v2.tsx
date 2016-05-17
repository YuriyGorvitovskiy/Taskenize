import * as React from 'react';
import * as Moment from 'moment';

import * as Timer from './timer-v2';

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

        var durationFrom = Model.getStartedMoment(task);
        var durationPlus = Model.calculateCompletedDuration(task);

        $.each(durations, (index: number, period: Model.Period) => {
            var toPart;
            var timer;
            if (period.end == null) {
                toPart = <input
                        className="tz-to"
                        type="text"
                        value="In progress..."
                        readOnly/>;
                timer = <Timer.Component className="tz-duration" from={durationFrom} />;
            } else {
                toPart = <input
                        className="tz-to"
                        type="datetime-local"
                        step="1"
                        value={TextUtil.formatInputDateTimeLocal(period.end, true)}
                        required/>
                timer = <Timer.Component className="tz-duration" plus={Model.calculatePeriodDuration(period)} />;
            }
            sections.push(
                <section className="tz-period" key={index}>
                    {toPart}
                    <input  className="tz-from"
                            type="datetime-local"
                            step="1" 
                            value={TextUtil.formatInputDateTimeLocal(period.begin, true)}
                            required/>
                    {timer}
                    <br/>
                    <a className="tz-action tz-delete" href="#"></a>
                </section>
            );
        });
        return (
            <div className="tz-sidebar tz-task-duration">
                <header>
                    <span className="tz-title">Duration</span>
                    <Timer.Component
                            className="tz-duration"
                            from={durationFrom}
                            plus={durationPlus} />
                </header>
                {sections}
            </div>
        );
    }
}
