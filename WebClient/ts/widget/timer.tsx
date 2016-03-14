import * as React from 'react';
import * as Moment from 'moment';

import * as TextUtil from '../util/text';

export interface Props extends React.Props<Component> {
    active: boolean;
    from:   Moment.Moment;
    plus:   Moment.Duration;
};

export interface State {
    current:   Moment.Moment;
};

export class Component extends React.Component<Props, {}> {

    timer: number = null;

    public constructor() {
        super();
    }

    public componentDidMount() {
        if (this.props.active)
            this.timer = setInterval(this.onTick.bind(this), 1000);
    }

    public componentWillUnmount() {
        if (this.timer !== null)
            clearInterval(this.timer);
    }

    public onTick() {
        this.setState
        this.forceUpdate();
    }

    public render() {
        var duration = this.props.plus || Moment.duration(0);
        if (this.props.active)
            duration = Moment.duration(duration).add(Moment.duration(Moment().diff(Moment(this.props.from))));

        return <div className="timer">{TextUtil.formatDuration(duration)}</div>
    }
}
