import * as React from 'react';
import * as Moment from 'moment';

import * as InputTime from './input-time-v2';
import * as Timer from './timer-v2';


import * as Model from '../model/task';
import * as TextUtil from '../util/text';

class Props {
    task: Model.Task;
    onChange: (serverTask: Model.Task) => any;
    onDelete: () => any;
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
                toPart = <input id={"to"+index} className="tz-to" type="text" value="In progress..." readOnly/>;
                timer = <Timer.Component className="tz-duration" from={durationFrom} />;
            } else {
                toPart = <InputTime.Component id={"to"+index} className="tz-to" label={null} value={period.end} onSuccess={this.onPeriodToChange.bind(this, index)}/>
                timer = <Timer.Component className="tz-duration" plus={Model.calculatePeriodDuration(period)} />;
                deletePeriod = <a className="tz-action tz-delete-period" href="#" onClick={this.onDeletePeriod.bind(this, index)}></a>;
            }
            sections.push(
                <section className="tz-period" key={index}>
                    {toPart}
                    <InputTime.Component id={"from"+index} className="tz-from" label={null} value={period.begin} onSuccess={this.onPeriodFromChange.bind(this, index)}/>
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
                <a className="tz-action tz-delete-task" href="#" onClick={this.onDeleteTask.bind(this)}>Delete Task</a>
            </div>
        );
    }

    public onDeletePeriod(index: number, ev: React.MouseEvent) {
        ev.preventDefault();
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }

    public onDeleteTask(ev: React.MouseEvent) {
        ev.preventDefault();
        this.props.onDelete();
    }

    public onPeriodToChange(index: number, value: Date) {
        this.props.task.duration[index].end = value;
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'end')
             .then((task)=>this.props.onChange(task));
    }

    public onPeriodFromChange(index: number, value: Date) {
        this.props.task.duration[index].begin = value;
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'begin')
             .then((task)=>this.props.onChange(task));
    }
}
