import * as Moment from "moment";
import * as React from "react";

import * as Model from "../model/task";
import * as TextUtil from "../util/text";

import * as Calendar from "./calendar-link";
import * as Complete from "./complete-button";
import * as HtmlEditor from "./html-editor";
import * as TaskBehavior from "./task-behavior";
import * as TaskCommon from "./task-common";
import * as TaskDuration from "./task-wide-duration";
import * as Play from "./timer-button-wide";

export class Component extends TaskCommon.Component {
    public constructor() {
        super();
    }

    public render() {
        const task = this.props.task;
        const active = (task.state === Model.State.RUNNING);
        const collapsed = this.state.collapsed;
        const category = Model.Category.MAP[task.category];
        const plus = Model.calculateCompletedDuration(this.props.task);
        const from = active ? Moment(this.props.task.duration[0].begin) : null;
        let behavior = null;
        let duration = null;
        if (!collapsed) {
            behavior = (
                <TaskBehavior.Component
                    task={task}
                    requestUncompletedTasks={this.props.requestUncompletedTasks}
                />
            );
            if (task.duration && task.duration.length > 0) {
                duration = (<TaskDuration.Component task={this.props.task} />);
            }
        }
        const className =
            "task-wide " +
            (collapsed ? "task-collapsed" : "task-expanded") +
            " panel panel-" + (active ? "primary" : "default");

        return (
            <div className={className} >
                <div className={"inside bg-" + (category ? category.css : "default")}>
                    <Complete.Wide task={task} onComplete={this.onComplete} onPause={this.onPause} />
                    <Play.Component task={task} onPlay={this.onPlay} onPause={this.onPause} />
                    <HtmlEditor.Component
                        className="title"
                        singleLine={true}
                        html={this.props.task.title}
                        onSuccess={this.onTitleChange}
                        onCancel={this.onTitleChange}
                    />
                    <HtmlEditor.Component
                        className="subject"
                        singleLine={false}
                        html={this.props.task.subject}
                        onSuccess={this.onSubjectChange}
                        onCancel={this.onSubjectChange}
                    />
                    {behavior}
                    {duration}
                    <div className="footer">
                        <div className="info">
                            <label>x:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.context}
                                onSuccess={this.onContextChange}
                                onCancel={this.onContextChange}
                            />
                            <label>&nbsp;c:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.category}
                                onSuccess={this.onCategoryChange}
                                onCancel={this.onCategoryChange}
                            />
                            <label>&nbsp;p:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.project}
                                onSuccess={this.onProjectChange}
                                onCancel={this.onProjectChange}
                            />
                            <label>&nbsp;s:&nbsp;</label>
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={this.props.task.story}
                                onSuccess={this.onStoryChange}
                                onCancel={this.onStoryChange}
                            />
                        </div>
                        <div className="defer">
                            <Calendar.Component
                                id={this.props.task._id}
                                date={this.props.task.scheduled}
                                onChange={this.onScheduledCalendarChange}
                            />&nbsp;
                            <HtmlEditor.Component
                                className="category"
                                singleLine={true}
                                html={TextUtil.formatDate(this.props.task.scheduled, false)}
                                onSuccess={this.onScheduledChange}
                                onCancel={this.onScheduledChange}
                            />&nbsp;
                            <a href="#" onClick={this.onScheduledNextDay} >+1</a>&nbsp;
                            <a href="#" onClick={this.onScheduledNextWeek} >+7</a>&nbsp;
                            <a href="#" onClick={this.onScheduledNextMonth} >+30</a>&nbsp;
                        </div>
                    </div>
                    <a className="duplicate" href="#" onClick={this.onDuplicate} >
                        <span className="glyphicon glyphicon-duplicate" />
                    </a>
                    <a className="delete" href="#" onClick={this.onDelete} >
                        <span className="glyphicon glyphicon-trash" />
                    </a>
                    <a className="expand" href="#" onClick={this.onOpen} >
                        <span className={"glyphicon glyphicon-triangle-" + (collapsed ? "right" : "bottom")} />
                    </a>
                </div>
            </div>
        );
    }

    protected onOpen = (ev) => {
        ev.preventDefault();
        this.setState({collapsed: !this.state.collapsed});
    }
}
