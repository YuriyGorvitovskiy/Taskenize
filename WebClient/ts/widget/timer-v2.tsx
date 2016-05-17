import * as React from 'react';
import * as Moment from 'moment';

import * as TextUtil from '../util/text';

export interface Props extends React.Props<Component> {
    from?:      Moment.Moment;
    plus?:      Moment.Duration;
    className?: string;
};

export class Component extends React.Component<Props, {}> {

    timer: number = null;

    mounted: boolean = false;

    public constructor() {
        super();
    }

    public componentDidMount() {
        this.mounted = true;
        this.checkTimer();
    }

    public componentWillUnmount() {
        this.mounted = false;
        this.checkTimer();
    }

    protected checkTimer() {
        if (this.mounted && this.props.from != null && this.timer === null) {
            this.timer = setInterval(this.onTick.bind(this), 1000);
        } else if ((!this.mounted || this.props.from == null) && this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    protected onTick() {
        this.forceUpdate();
    }

    public render() {
        this.checkTimer();

        var duration = this.props.plus || Moment.duration(0);
        if (this.props.from !== null)
            duration = Moment.duration(duration).add(Moment.duration(Moment().diff(Moment(this.props.from))));

        return (
            <span className={this.props.className || ""}>{TextUtil.formatDuration(duration)}</span>
        );
    }
}
