import * as $ from 'jquery';
import * as Moment from 'moment';
import * as React from 'react';
import * as Model from '../model/task';
import * as Calendar from './calendar-button';
import * as HtmlEditor from './html-editor';
import * as Timer from './timer';
import * as TextInput from './text-editor';
import * as TextUtil from '../util/text';

export interface Props extends React.Props<Component> {
    task: Model.Task;
};

interface State {
}

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {
        }
    }

    public render() {
        var durations = [];
        $.each(this.props.task.duration, (index: number, period: Model.Period) => {
            var active = (index == 0 && this.props.task.state == Model.State.RUNNING);
            var from = active ? Moment(period.begin) : null;
            var plus = Moment.duration(Moment(period.end).diff(Moment(period.begin)));

            var fromPart = (
                <div className="duration-from">
                    <input  type="datetime-local"
                            value={TextUtil.formatInputDateTimeLocal(period.begin, true)}
                            onChange={this.onDurationBeginChange.bind(this, index)}
                    />
                </div>
            );
            var timePart = (<Timer.Component active={active} from={from} plus={plus} />);
            var toPart;
            var actionPart;
            if (period.end == null) {
                toPart = (
                    <div className="duration-to">
                        <input  type="text"
                                className="text-center"
                                disabled={true}
                                value="in progress"/>
                    </div>
                );
                actionPart = (
                    <div className="button-spacer">&nbsp;</div>
                );
            } else {
                toPart = (
                    <div className="duration-to">
                        <input  type="datetime-local"
                             value={TextUtil.formatInputDateTimeLocal(period.end, true)}
                             onChange={this.onDurationEndChange.bind(this, index)}
                        />
                    </div>
                );
                actionPart = (
                    <button type="button" className="btn btn-default" onClick={this.onDeletePeriod.bind(this,index)}>
                        <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                    </button>
                );
            }

            durations.push(
                <div className="duration-block" key={index} >
                    {actionPart}
                    {timePart}
                    {toPart}
                    {fromPart}
                </div>
            );
        });
        return (
            <div className="form-group duration">
                {durations}
            </div>
        );
    }

    public onDurationBeginChange(index: number, ev: React.SyntheticEvent) {
        var text = ev.target["value"];
        if (TextUtil.formatDate(this.props.task.duration[index].begin, true) == text)
            return;

        var time = TextUtil.parseDate(text)
        if (time == null)
            return;

        this.props.task.duration[index].begin = time;
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'begin');
    }

    public onDurationEndChange(index: number, ev: React.SyntheticEvent) {
        var text = ev.target["value"];
        if (TextUtil.formatDate(this.props.task.duration[index].end, true) == text)
            return;

        var time = TextUtil.parseDate(text)
        if (time == null)
            return;

        this.props.task.duration[index].end = time;
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'end');
    }

    public onDeletePeriod(index: number) {
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }

};
