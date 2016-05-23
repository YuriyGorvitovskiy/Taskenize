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
            var deletePeriod;
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
                deletePeriod = <a className="tz-action tz-delete" href="#" onClick={this.onDeletePeriod.bind(this, index)}></a>;
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
                    {deletePeriod}
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

    public onDeletePeriod(index: number, ev: React.MouseEvent) {
        ev.preventDefault();
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }

}
