import * as $ from 'jquery';
import * as Moment from 'moment';
import * as React from 'react';
import * as Model from '../model/task';
import * as Calendar from './calendar-button';
import * as HtmlEditor from './html-editor';
import * as Timer from './task-timer';
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
            var fromPart = (
                <TextInput.Component
                     className="form-control text-center"
                     text={TextUtil.formatDate(period.begin, true)}
                     placeholder="YYYY/MM/DD HH:MM:SS"
                     onSuccess={this.onDurationBeginChange.bind(this, index)} />
            );
            var toPart;
            var timePart;
            var actionPart;
            if (period.end == null) {
                toPart = (
                    <input
                        type="text"
                        className="form-control text-center"
                        readOnly={true}
                        value="in progress"/>
                );
                timePart = (
                    <input
                        type="text"
                        className="form-control text-center"
                        readOnly={true}
                        value="..."/>
                );
                actionPart = (<div className="input-group-addon btn-blank">&nbsp;</div>);
            } else {
                 toPart = (
                    <TextInput.Component
                         className="form-control text-center"
                         text={TextUtil.formatDate(period.end, true)}
                         placeholder="YYYY/MM/DD HH:MM:SS"
                         onSuccess={this.onDurationEndChange.bind(this, index)} />
                 );
                 timePart = (
                     <input
                        type="text"
                        className="form-control text-center"
                        readOnly={true}
                        value={TextUtil.formatPeriod(period.begin, period.end)}/>
                );
                actionPart = (
                    <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={this.onDeletePeriod.bind(this,index)}>
                            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </span>
                );
            }

            durations.push(
                <div className="input-group" key={index} >
                    {fromPart}
                    <div className="input-group-addon">to</div>
                    {toPart}
                    <div className="input-group-addon">took</div>
                    {timePart}
                    {actionPart}
                </div>
            );
        });
        return (
            <div className="form-group duration">
                <label className="control-label">Duration</label>
                {durations}
            </div>
        );
    }

    public onDurationBeginChange(index: number, text: string) {
        if (TextUtil.formatDate(this.props.task.duration[index].begin, true) == text)
            return;

        this.props.task.duration[index].begin = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'begin');
    }

    public onDurationEndChange(index: number, text: string) {
        if (TextUtil.formatDate(this.props.task.duration[index].end, true) == text)
            return;

        this.props.task.duration[index].end = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'end');
    }

    public onDeletePeriod(index: number) {
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }

};
