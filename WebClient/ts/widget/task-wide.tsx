import * as $ from 'jquery';
import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as Complete from './complete-button';
import * as Play from './timer-button-wide';
import * as HtmlEditor from './html-editor';
import * as TaskCommon from './task-common';
import * as TextUtil from '../util/text';


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
            <div className={"task-wide panel panel-" + (active ? "primary" : "default")}>
                <div className={"inside bg-" + (category ? category.css : "default")}>
                    <Complete.Wide task={task} onComplete={this.onComplete.bind(this)} onPause={this.onPause.bind(this)}/>
                    <Play.Component task={task} onPlay={this.onPlay.bind(this)} onPause={this.onPause.bind(this)}/>
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
                    <div className="footer">
                        <div className="defer">
                            <a href="#"><span className="glyphicon glyphicon-calendar" aria-hidden="true"></span></a>&nbsp;
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={TextUtil.formatDate(this.props.task.scheduled, false)}
                                onSuccess={this.onStoryChange.bind(this)}
                                onCancel={this.onStoryChange.bind(this)}
                            />&nbsp;
                            <a href="#">+1</a>&nbsp;
                            <a href="#">+7</a>&nbsp;
                            <a href="#">+30</a>
                        </div>
                        <div className="info">
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.context}
                                onSuccess={this.onContextChange.bind(this)}
                                onCancel={this.onContextChange.bind(this)}
                            />
                            <label>&nbsp;&bull;&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.category}
                                onSuccess={this.onCategoryChange.bind(this)}
                                onCancel={this.onCategoryChange.bind(this)}
                            />
                            <label>&nbsp;&bull;&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.project}
                                onSuccess={this.onProjectChange.bind(this)}
                                onCancel={this.onProjectChange.bind(this)}
                            />
                            <label>&nbsp;&bull;&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.story}
                                onSuccess={this.onStoryChange.bind(this)}
                                onCancel={this.onStoryChange.bind(this)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

};
