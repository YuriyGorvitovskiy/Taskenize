import * as $ from "jquery";
import * as Moment from "moment";
import * as React from "react";

import * as Model from "../model/task";
import * as TextUtil from "../util/text";

import * as Calendar from "./calendar-button";
import * as HtmlEditor from "./html-editor";
import * as TextInput from "./text-editor";
import * as Timer from "./timer";

export interface IProps extends React.Props<Component> {
    task: Model.ITask;
}

export class Component extends React.Component<IProps, {}> {
    public constructor() {
        super();
    }

    public render() {
        const durations = [];
        $.each(this.props.task.duration, (index: number, period: Model.IPeriod) => {
            const active = (index === 0 && this.props.task.state === Model.State.RUNNING);
            const from = active ? Moment(period.begin) : null;
            const plus = Moment.duration(Moment(period.end).diff(Moment(period.begin)));

            const fromPart = (
                <div className="duration-from">
                    <input
                        type="datetime-local"
                        value={TextUtil.formatInputDateTimeLocal(period.begin, true)}
                        // tslint:disable-next-line:jsx-no-lambda
                        onChange={(ev) => this.onDurationBeginChange(index, ev)}
                    />
                </div>
            );
            const timePart = (<Timer.Component active={active} from={from} plus={plus} />);
            let toPart;
            let actionPart;
            if (period.end == null) {
                toPart = (
                    <div className="duration-to">
                        <input
                            type="text"
                            className="text-center"
                            disabled={true}
                            value="in progress"
                        />
                    </div>
                );
                actionPart = (
                    <div className="button-spacer">&nbsp;</div>
                );
            } else {
                toPart = (
                    <div className="duration-to">
                        <input
                            type="datetime-local"
                            value={TextUtil.formatInputDateTimeLocal(period.end, true)}
                            // tslint:disable-next-line:jsx-no-lambda
                            onChange={(ev) => this.onDurationEndChange(index, ev)}
                        />
                    </div>
                );
                actionPart = (
                    <button
                        type="button"
                        className="btn btn-default"
                        // tslint:disable-next-line:jsx-no-lambda
                        onClick={() => this.onDeletePeriod(index)}
                    >
                        <span className="glyphicon glyphicon-trash" aria-hidden="true" />
                    </button>
                );
            }

            durations.push((
                <div className="duration-block" key={index} >
                    {actionPart}
                    {timePart}
                    {toPart}
                    {fromPart}
                </div>
            ));
        });
        return (
            <div className="form-group duration">
                {durations}
            </div>
        );
    }

    public onDurationBeginChange(index: number, ev: React.ChangeEvent<any>) {
        const text = ev.target.value;
        if (TextUtil.formatDate(this.props.task.duration[index].begin, true) === text) {
            return;
        }

        const time = TextUtil.parseDate(text);
        if (time == null) {
            return;
        }

        this.props.task.duration[index].begin = time;
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, "begin");
    }

    public onDurationEndChange(index: number, ev: React.ChangeEvent<any>) {
        const text = ev.target.value;
        if (TextUtil.formatDate(this.props.task.duration[index].end, true) === text) {
            return;
        }

        const time = TextUtil.parseDate(text);
        if (time == null) {
            return;
        }

        this.props.task.duration[index].end = time;
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, "end");
    }

    public onDeletePeriod(index: number) {
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }

}
