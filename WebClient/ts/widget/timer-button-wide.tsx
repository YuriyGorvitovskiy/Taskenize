import * as Moment from "moment";
import * as React from "react";

import * as Model from "../model/task";
import * as TextUtil from "../util/text";

import * as Timer from "./timer";

export interface IProps extends React.Props<Component> {
    task: Model.ITask;
    onPlay: () => any;
    onPause: () => any;
}

export class Component extends React.Component<IProps, {}> {
    public constructor() {
        super();
    }

    public render() {
        const active = (this.props.task.state === Model.State.RUNNING);
        const plus = Model.calculateCompletedDuration(this.props.task);
        const from = active ? Moment(this.props.task.duration[0].begin) : null;
        const onClick = active ? this.props.onPause : this.props.onPlay;
        return (
            <button className={"timer-btn btn btn-" + (active ? "primary" : "default")} onClick={onClick}>
                <Timer.Component active={active} from={from} plus={plus} />
                <div className="glyph">
                    <span className={"glyphicon glyphicon-" + (active ? "pause" : "play")} />
                </div>
            </button>
        );
    }
}
