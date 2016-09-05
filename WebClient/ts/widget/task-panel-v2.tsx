import * as React from 'react';
import * as Moment from 'moment';

import * as Timer from './timer-v2';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

class Props {
    task: Model.Task;
    selected: boolean;
    onClick: () => any;
    onStateChange: (newState: Model.State) => any;
}

export class Component extends React.Component<Props, {}> {
    public render() {
        var glyph = "\ue021";
        switch (this.props.task.category) {
            case "House":
                glyph = "\ue021";
                break;
            case "Hobby":
                glyph = "\ue184";
                break;
            case "Recreation":
                glyph = "\u26fa";
                break;
            case "Shop":
                glyph = "\ue116";
                break;
            case "Education":
                glyph = "\ue233";
                break;
            case "Pleasure":
                glyph = "\ue059";
                break;
        }
        var task = this.props.task;
        var cssSelected = (this.props.selected ? " tz-selected" : "");
        var cssState = "";
        switch(task.state) {
            case Model.State.PAUSED: cssState = " tz-state-paused"; break;
            case Model.State.RUNNING: cssState = " tz-state-running"; break;
            case Model.State.COMPLETED: cssState = " tz-state-completed"; break;
        }
        var durationFrom = Model.getStartedMoment(task);
        var durationPlus = Model.calculateCompletedDuration(task);
        return (
            <article className={"tz-task" + cssSelected + cssState} onClick={this.props.onClick} >
                <a className="tz-action-complete" href="#" onClick={this.onComplete.bind(this)}>
                    <span className="tz-category-icon">{glyph}</span>
                    <span className="tz-state"></span>
                </a>
                <a className="tz-action-play" href="#" onClick={this.onPlay.bind(this)}>
                    <Timer.Component
                            className="tz-duration"
                            from={durationFrom}
                            plus={durationPlus} />
                    <span className="tz-state"></span>
                </a>
                <div className="tz-info">
                    <div className="tz-title">{this.props.task.title}</div>
                    <div className="tz-subject" dangerouslySetInnerHTML={{__html:this.props.task.subject}} ></div>
                    <div className="tz-extra">
                        <div className="tz-classification">
                            <span className="tz-label">x:</span>
                            <span className="tz-value">{this.props.task.context}</span>
                        </div>
                        <div className="tz-classification">
                            <span className="tz-label">c:</span>
                            <span className="tz-value">{this.props.task.category}</span>
                        </div>
                        <div className="tz-classification">
                            <span className="tz-label">p:</span>
                            <span className="tz-value">{this.props.task.project}</span>
                        </div>
                        <div className="tz-classification">
                            <span className="tz-label">s:</span>
                            <span className="tz-value">{this.props.task.story}</span>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    public onComplete(ev : React.MouseEvent) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.props.task.state == Model.State.COMPLETED)
            this.props.onStateChange(Model.State.PAUSED);
        else
            this.props.onStateChange(Model.State.COMPLETED);
    }

    public onPlay(ev : React.MouseEvent) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.props.task.state == Model.State.RUNNING)
            this.props.onStateChange(Model.State.PAUSED);
        else
            this.props.onStateChange(Model.State.RUNNING);
    }
}
