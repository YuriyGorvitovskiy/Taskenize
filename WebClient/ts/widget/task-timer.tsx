import * as React from "react";

import * as Model from "../model/task";
import * as TextUtil from "../util/text";

export interface IProps extends React.Props<Component> {
    task: Model.ITask;
}

export class Component extends React.Component<IProps, {}> {

    protected timer: number = null;

    public constructor() {
        super();
    }

    public componentDidMount() {
        if (this.props.task.state === Model.State.RUNNING) {
            this.timer = setInterval(this.onTick.bind(this), 1000);
        }
    }

    public componentWillUnmount() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
    }

    public onTick() {
        this.forceUpdate();
    }

    public render() {
        return (
            <span>{TextUtil.formatDuration(Model.calculateDuration(this.props.task))}</span>
        );
    }
}
