import * as $ from 'jquery';
import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as Complete from './complete-button';
import * as Play from './timer-button-narrow';
import * as Timer from './timer';
import * as HtmlEditor from './html-editor';
import * as TaskCommon from './task-common';


export class Component extends TaskCommon.Component {
    public constructor() {
        super();
        this.state = {
        }
    }

    public render() {
        var task = this.props.task;
        var active = (task.state == Model.State.RUNNING);
        var category = Model.Category.MAP[task.category];
        var plus = Model.calculateCompletedDuration(this.props.task);
        var from = active ? Moment(this.props.task.duration[0].begin) : null;

        return (
            <div className={"task-narrow panel panel-" + (active ? "primary" : "default")}>
                <div className={"inside bg-" + (category ? category.css : "default")}>
                    <Complete.Narrow task={task} onComplete={this.onComplete.bind(this)} onPause={this.onPause.bind(this)}/>
                    <Play.Component task={task} onPlay={this.onPlay.bind(this)} onPause={this.onPause.bind(this)}/>
                    <Timer.Component active={active} from={from} plus={plus} />
                    <HtmlEditor.Component
                        className="title"
                        singleLine={true}
                        html={this.props.task.title}
                        onSuccess={this.onTitleChange.bind(this)}
                        onCancel={this.onTitleChange.bind(this)}
                     />
                     <HtmlEditor.Component
                         className="subject"
                         singleLine={false}
                         html={this.props.task.subject}
                         onSuccess={this.onSubjectChange.bind(this)}
                         onCancel={this.onSubjectChange.bind(this)}
                      />
                </div>
            </div>
        );
    }
};
