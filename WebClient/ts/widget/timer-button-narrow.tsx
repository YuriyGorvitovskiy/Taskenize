import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

import * as Timer from './timer';

export interface Props extends React.Props<Component> {
    task:    Model.Task;
    onPlay:  () => any;
    onPause: () => any;
};

export class Component extends React.Component<Props, {}> {
    public constructor() {
        super();
    }

    public render() {
        var active = (this.props.task.state == Model.State.RUNNING);
        var onClick = active ? this.props.onPause : this.props.onPlay;
        return (
            <button className={"timer-btn btn btn-" + (active ? "primary" : "default")} onClick={onClick}>
                <div className="glyph"><span className={"glyphicon glyphicon-" + (active ? "pause": "play")}></span></div>
            </button>
        );
    }
}