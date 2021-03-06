import * as Moment from "moment";
import * as React from "react";

import * as TextUtil from "../util/text";

export interface IProps extends React.Props<Component> {
    active: boolean;
    from: Moment.Moment;
    plus: Moment.Duration;
    onClick?: (ev: React.SyntheticEvent<any>) => any;
}

export class Component extends React.Component<IProps, {}> {

    protected timer: number = null;
    protected mounted: boolean = false;

    public constructor() {
        super();
    }

    public componentDidMount() {
        this.mounted = true;
        if (this.props.active && this.timer === null) {
            this.timer = setInterval(this.onTick.bind(this), 1000);
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
    }

    public onTick() {
        this.forceUpdate();
    }

    public render() {
        let duration = this.props.plus || Moment.duration(0);
        if (this.props.active) {
            duration = Moment.duration(duration).add(Moment.duration(Moment().diff(Moment(this.props.from))));
        }

        if (this.props.active && this.mounted && this.timer === null) {
            this.timer = setInterval(this.onTick.bind(this), 1000);
        }

        return (
            <div
                onClick={this.props.onClick}
                className={"timer" + (this.props.active ? " active" : "")}
            >
                {TextUtil.formatDuration(duration)}
            </div>
        );
    }
}
