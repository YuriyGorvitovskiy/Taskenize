import * as Moment from "moment";
import * as React from "react";

import * as Model from "../model/task";
import * as TextUtil from "../util/text";

import * as Complete from "./complete-button";
import * as HtmlEditor from "./html-editor";
import * as TaskBehavior from "./task-behavior";
import * as TaskCommon from "./task-common";
import * as TaskDuration from "./task-narrow-duration";
import * as Timer from "./timer";
import * as Play from "./timer-button-narrow";

const TOUCH_TOLERANCE = 30;
const TOUCH_TIME_TOLARENCE = 500;

const SLIDE_LEFT = 192;
const SLIDE_RIGHT = -128;
const SLIDE_LEFT_MAX = 200;
const SLIDE_RIGHT_MIN = -136;

enum TouchIntention {
    UNKNOWN,
    SLIDE,
    DONT_CARE,
}

export class Component extends TaskCommon.Component {
    protected leftActions: any;
    protected taskPanel: any;
    protected rightActions: any;

    protected initialTouch: React.Touch;
    protected initialTouchTime: Date;
    protected lastTouch: React.Touch;
    protected touchIntention: TouchIntention = TouchIntention.UNKNOWN;

    public constructor() {
        super();
    }

    public render() {
        const task = this.props.task;
        const active = (task.state === Model.State.RUNNING);
        const category = Model.Category.MAP[task.category];
        const plus = Model.calculateCompletedDuration(this.props.task);
        const from = active ? Moment(this.props.task.duration[0].begin) : null;
        const collapsed = this.state.collapsed;

        let duration = null;
        if (!collapsed && task.duration && task.duration.length > 0) {
            duration = (<TaskDuration.Component task={this.props.task} />);
        }

        if (collapsed) {
            return (
                <div className="task-narrow">
                    <div
                        className="left-action-group"
                        ref={(c) => this.leftActions = c}
                    >
                        <button
                            className="left-action btn btn-info"
                            onClick={this.onNarrowScheduledNextDay}
                        >
                            <b>+1</b>
                        </button>
                        <button
                            className="left-action btn btn-info"
                            onClick={this.onNarrowScheduledNextWeek}
                        >
                            <b>+7</b>
                        </button>
                        <button
                            className="left-action btn btn-info"
                            onClick={this.onNarrowScheduledNextMonth}
                        >
                            <b>+30</b>
                        </button>
                    </div>
                    <div
                        className={"panel panel-" + (active ? "primary" : "default")}
                        onTouchStart={this.onTouchStart}
                        onTouchMove={this.onTouchMove}
                        onTouchEnd={this.onTouchEnd}
                        onTouchCancel={this.onTouchCancel}
                        ref={(c) => this.taskPanel = c}
                    >
                        <div className={"inside bg-" + (category ? category.css : "default")}>
                            <Complete.Narrow task={task} onComplete={this.onComplete} onPause={this.onPause}/>
                            <Play.Component task={task} onPlay={this.onPlay} onPause={this.onPause}/>
                            <button
                                className="btn btn-default expand"
                                onClick={this.onCollapse}
                            >
                                <span className="glyph">
                                    <span className="glyphicon glyphicon-triangle-bottom"/>
                                </span>
                            </button>
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
                        </div>
                    </div>
                    <div
                        className="right-action-group"
                        ref={(c) => this.rightActions = c}
                    >
                        <button
                            className="right-action btn btn-warning"
                            onClick={this.onNarrowDuplicate}
                        >
                            <span className="glyphicon glyphicon-duplicate"/>
                        </button>
                        <button
                            className="right-action btn btn-danger"
                            onClick={this.onNarrowDelete}
                        >
                            <span className="glyphicon glyphicon-trash"/>
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="task-narrow-expanded">
                <div
                    className={"panel panel-" + (active ? "primary" : "default")}
                    onTouchStart={this.onTouchStart}
                    onTouchMove={this.onTouchMove}
                    onTouchEnd={this.onTouchEnd}
                    onTouchCancel={this.onTouchCancel}
                    ref={(c) => this.taskPanel = c}
                >
                    <div className={"inside bg-" + (category ? category.css : "default")}>
                        <Complete.Narrow task={task} onComplete={this.onComplete} onPause={this.onPause}/>
                        <Play.Component task={task} onPlay={this.onPlay} onPause={this.onPause}/>
                        <label className="label-title">Title:</label>
                        <button
                            className="btn btn-default expand"
                            onClick={this.onCollapse}
                        >
                            <div className="glyph"><span className="glyphicon glyphicon-triangle-top"/></div>
                        </button>
                        <HtmlEditor.Component
                            className="title"
                            singleLine={true}
                            html={this.props.task.title}
                            onSuccess={this.onTitleChange}
                            onCancel={this.onTitleChange}
                        />
                        <label className="label-subject">Subject</label>
                        <HtmlEditor.Component
                             className="subject"
                             singleLine={false}
                             html={this.props.task.subject}
                             onSuccess={this.onSubjectChange}
                             onCancel={this.onSubjectChange}
                        />
                        <label className="label-category">Context</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.context}
                            onSuccess={this.onContextChange}
                            onCancel={this.onContextChange}
                        />
                        <label className="label-category">Category</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.category}
                            onSuccess={this.onCategoryChange}
                            onCancel={this.onCategoryChange}
                        />
                        <label className="label-category">Project</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.project}
                            onSuccess={this.onProjectChange}
                            onCancel={this.onProjectChange}
                        />
                        <label className="label-category">Story</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.story}
                            onSuccess={this.onStoryChange}
                            onCancel={this.onStoryChange}
                        />
                        <label className="label-category">Schedule</label>
                        <div className="input-group">
                            <span className="input-group-btn">
                                <button
                                    className="btn btn-primary"
                                    onClick={this.onNarrowScheduledNextDay}
                                >
                                    <b>+1</b>
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={this.onNarrowScheduledNextWeek}
                                >
                                    <b>+7</b>
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={this.onNarrowScheduledNextMonth}
                                >
                                    <b>+30</b>
                                </button>
                            </span>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={TextUtil.formatInputDateTimeLocal(this.props.task.scheduled, false)}
                                onChange={this.onNarrowScheduledChange}
                            />
                        </div>
                        <TaskBehavior.Component
                            task={task}
                            requestUncompletedTasks={this.props.requestUncompletedTasks}
                        />
                        <div className="duration" >
                            <Timer.Component active={active} from={from} plus={plus} onClick={this.onCollapse}/>
                            <label className="label-duration">Duration</label>
                            {duration}
                        </div>
                        <div className="delete">
                            <button
                                className="btn btn-danger"
                                ref={(c) => this.rightActions = c}
                                onClick={this.onNarrowDelete}
                            >
                                <span className="glyphicon glyphicon-trash"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    public setSlidePos(pos: number) {
        this.leftActions.style.left = (pos - SLIDE_LEFT) + "px";
        this.taskPanel.style.left = pos + "px";
        this.rightActions.style.right = (-pos + SLIDE_RIGHT) + "px";
    }

    public animateSlidePos(pos: number) {
        $(this.leftActions).animate({left: (pos - SLIDE_LEFT) + "px"}, 500);
        $(this.taskPanel).animate({left: pos + "px"}, 500);
        $(this.rightActions).animate({right: (-pos + SLIDE_RIGHT) + "px"}, 500);
    }

    protected onNarrowScheduledNextDay = (ev) => {
        this.onScheduledNextDay(ev);
        this.animateSlidePos(0);
    }

    protected onNarrowScheduledNextWeek = (ev) =>  {
        this.onScheduledNextWeek(ev);
        this.animateSlidePos(0);
    }

    protected onNarrowScheduledNextMonth = (ev) => {
        this.onScheduledNextMonth(ev);
        this.animateSlidePos(0);
    }

    protected onNarrowScheduledChange = (ev) => {
        this.onScheduledChange(ev.target.value);
    }
    protected onNarrowDelete = (ev) => {
        this.setSlidePos(0);
        this.onDelete(ev);
    }
    protected onNarrowDuplicate = (ev) => {
        this.setSlidePos(0);
        this.onDuplicate(ev);
    }
    protected onCollapse = (ev: React.SyntheticEvent<any>) => {
        ev.preventDefault();
        console.log("onCollapse");
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    protected onTouchStart = (ev: React.TouchEvent<any>) => {
        this.props.onSlide(this, false);
        // tslint:disable-next-line:max-line-length
        // console.log("onTouchStart – SY: " + ev.touches[0].screenY + ", PY: " + ev.touches[0].pageY + ", CY: " + ev.touches[0].clientY);
        if (ev.touches.length !== 1) {
            this.touchIntention = TouchIntention.DONT_CARE;
            return true;
        }

        this.initialTouch = this.lastTouch = $.extend({}, ev.touches[0]);
        this.initialTouchTime = new Date();
        this.touchIntention = TouchIntention.UNKNOWN;
        return true;
    }
    protected onTouchMove = (ev: React.TouchEvent<any>) => {
        // tslint:disable-next-line:max-line-length
        // console.log("onTouchMove – SY: " + ev.touches[0].screenY + ", PY: " + ev.touches[0].pageY + ", CY: " + ev.touches[0].clientY);
        if (!this.checkTouch(ev)) {
            return true;
        }

        this.lastTouch = $.extend({}, ev.touches[0]);
        let slide = this.lastTouch.screenX - this.initialTouch.screenX;
        slide = Math.max(SLIDE_RIGHT_MIN, Math.min(SLIDE_LEFT_MAX, slide));
        this.setSlidePos(slide);

        return true;
    }
    protected onTouchEnd = (ev: React.TouchEvent<any>) => {
        // tslint:disable-next-line:max-line-length
        // console.log("onTouchEnd – SY: " + ev.touches[0].screenY + ", PY: " + ev.touches[0].pageY + ", CY: " + ev.touches[0].clientY);
        if (this.initialTouch == null) {
            return true;
        }

        const slide = this.lastTouch.pageX - this.initialTouch.pageX;
        if (slide > SLIDE_LEFT_MAX * 1 / 2) {
            this.animateSlidePos(SLIDE_LEFT);
            this.props.onSlide(this, true);
        } else if (slide < SLIDE_RIGHT_MIN * 1 / 2) {
            this.animateSlidePos(SLIDE_RIGHT);
            this.props.onSlide(this, true);
        } else {
            this.animateSlidePos(0);
        }

        this.resetTouch();
        return true;
    }
    protected onTouchCancel = (ev: React.TouchEvent<any>) => {
        if (this.initialTouch == null) {
            return true;
        }

        this.setSlidePos(0);
        this.resetTouch();
        return true;
    }

    protected checkTouch(ev: React.TouchEvent<any>) {
        if (this.initialTouch == null || this.touchIntention === TouchIntention.DONT_CARE) {
            return false;
        }

        if (ev.touches.length !== 1) {
            this.touchIntention = TouchIntention.DONT_CARE;
            this.animateSlidePos(0);
            this.resetTouch();
            return false;
        }
        if (this.touchIntention === TouchIntention.SLIDE) {
            return true;
        }

        const touch = ev.touches[0];
        const deltaY = Math.abs(touch.clientY - this.initialTouch.clientY);
        const deltaX = Math.abs(touch.screenX - this.initialTouch.screenX);
        if (deltaY < TOUCH_TOLERANCE && deltaX < TOUCH_TOLERANCE) {
            if ((new Date().getTime() - this.initialTouchTime.getTime()) > TOUCH_TIME_TOLARENCE) {
                this.touchIntention = TouchIntention.DONT_CARE;
            }
            return false;
        }
        if (deltaX < deltaY) {
            this.touchIntention = TouchIntention.DONT_CARE;
            return false;
        }
        this.touchIntention = TouchIntention.SLIDE;
        return true;
    }

    protected resetTouch() {
        this.initialTouch = null;
        this.initialTouchTime = null;
        this.lastTouch = null;
        this.touchIntention = TouchIntention.UNKNOWN;
    }
}
