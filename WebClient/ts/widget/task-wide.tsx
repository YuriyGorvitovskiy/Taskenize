import * as $ from 'jquery';
import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as Complete from './complete-button';
import * as Calendar from './calendar-link';
import * as Play from './timer-button-wide';
import * as HtmlEditor from './html-editor';
import * as TaskCommon from './task-common';
import * as TaskDuration from './task-wide-duration';
import * as TaskRepeat from './task-behavior';
import * as TextUtil from '../util/text';


export class Component extends TaskCommon.Component {
    public constructor() {
        super();
    }

    public render() {
        var task = this.props.task;
        var active = (task.state == Model.State.RUNNING);
        var collapsed = this.state.collapsed;
        var category = Model.Category.MAP[task.category];
        var plus = Model.calculateCompletedDuration(this.props.task);
        var from = active ? Moment(this.props.task.duration[0].begin) : null;
        var repeat = null;
        var duration = null;
        if (!collapsed) {
            repeat = (<TaskRepeat.Component />);
            if(task.duration && task.duration.length > 0) {
                duration = (<TaskDuration.Component task={this.props.task} />);
            }
        }


        return (
            <div className={"task-wide" + (collapsed ? " task-collapsed" : " task-expanded") + " panel panel-" + (active ? "primary" : "default")}>
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
                    {repeat}
                    {duration}
                    <div className="footer">
                        <div className="info">
                            <label>x:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.context}
                                onSuccess={this.onContextChange.bind(this)}
                                onCancel={this.onContextChange.bind(this)}
                            />
                            <label>&nbsp;c:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.category}
                                onSuccess={this.onCategoryChange.bind(this)}
                                onCancel={this.onCategoryChange.bind(this)}
                            />
                            <label>&nbsp;p:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.project}
                                onSuccess={this.onProjectChange.bind(this)}
                                onCancel={this.onProjectChange.bind(this)}
                            />
                            <label>&nbsp;s:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.story}
                                onSuccess={this.onStoryChange.bind(this)}
                                onCancel={this.onStoryChange.bind(this)}
                            />
                        </div>
                        <div className="defer">
                            <Calendar.Component
                                id={this.props.task._id}
                                date={this.props.task.scheduled}
                                onChange={this.onScheduledCalendarChange.bind(this)}
                            />&nbsp;
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={TextUtil.formatDate(this.props.task.scheduled, false)}
                                onSuccess={this.onScheduledChange.bind(this)}
                                onCancel={this.onScheduledChange.bind(this)}
                            />&nbsp;
                            <a href="#" onClick={this.onScheduledNextDay.bind(this)} >+1</a>&nbsp;
                            <a href="#" onClick={this.onScheduledNextWeek.bind(this)} >+7</a>&nbsp;
                            <a href="#" onClick={this.onScheduledNextMonth.bind(this)} >+30</a>&nbsp;
                        </div>
                    </div>
                    <a className="duplicate" href="#" onClick={this.onDuplicate.bind(this)} >
                        <span className="glyphicon glyphicon-duplicate" />
                    </a>
                    <a className="delete" href="#" onClick={this.onDelete.bind(this)} >
                        <span className="glyphicon glyphicon-trash" />
                    </a>
                    <a className="expand" href="#" onClick={this.onOpen.bind(this)} >
                        <span className={"glyphicon glyphicon-triangle-" + (collapsed ? "right" : "bottom")} />
                    </a>
                </div>
            </div>
        );
    }

    public onOpen(ev) {
        ev.preventDefault();
        this.setState({collapsed: !this.state.collapsed});
    }
};
