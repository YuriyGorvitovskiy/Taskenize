import * as $ from 'jquery';
import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as Complete from './complete-button';
import * as Play from './timer-button-narrow';
import * as Timer from './timer';
import * as HtmlEditor from './html-editor';
import * as TaskDuration from './task-narrow-duration';
import * as TaskCommon from './task-common';
import * as TextUtil from '../util/text';


const TOUCH_TOLERANCE = 30;
const TOUCH_TIME_TOLARENCE = 500;

const SLIDE_LEFT = 192;
const SLIDE_RIGHT = -128;
const SLIDE_LEFT_MAX  = 200;
const SLIDE_RIGHT_MIN  = -136;

enum TouchIntention {
    UNKNOWN,
    SLIDE,
    DONT_CARE
};

export class Component extends TaskCommon.Component {
    leftActions : any;
    taskPanel: any;
    rightActions : any;

    initialTouch : React.Touch;
    initialTouchTime : Date;
    lastTouch : React.Touch;
    touchIntention: TouchIntention = TouchIntention.UNKNOWN;


    public constructor() {
        super();
    }

    public render() {
        var task = this.props.task;
        var active = (task.state == Model.State.RUNNING);
        var category = Model.Category.MAP[task.category];
        var plus = Model.calculateCompletedDuration(this.props.task);
        var from = active ? Moment(this.props.task.duration[0].begin) : null;
        var collapsed = this.state.collapsed;

        var duration = null;
        if (!collapsed && task.duration && task.duration.length > 0)
            duration = (<TaskDuration.Component task={this.props.task} />);

        if (collapsed) {
            return (
                <div className="task-narrow">
                    <div className="left-action-group"
                        ref={(c) => this.leftActions = c}>
                        <button className="left-action btn btn-info"
                                onClick={this.onScheduledNextDay.bind(this)}>
                            <b>+1</b>
                        </button>
                        <button className="left-action btn btn-info"
                                onClick={this.onScheduledNextWeek.bind(this)}>
                            <b>+7</b>
                        </button>
                        <button className="left-action btn btn-info"
                                onClick={this.onScheduledNextMonth.bind(this)}>
                            <b>+30</b>
                        </button>
                    </div>
                    <div className={"panel panel-" + (active ? "primary" : "default")}
                         onTouchStart={this.onTouchStart.bind(this)}
                         onTouchMove={this.onTouchMove.bind(this)}
                         onTouchEnd={this.onTouchEnd.bind(this)}
                         onTouchCancel={this.onTouchCancel.bind(this)}
                         ref={(c) => this.taskPanel = c}>
                        <div className={"inside bg-" + (category ? category.css : "default")}>
                            <Complete.Narrow task={task} onComplete={this.onComplete.bind(this)} onPause={this.onPause.bind(this)}/>
                            <Play.Component task={task} onPlay={this.onPlay.bind(this)} onPause={this.onPause.bind(this)}/>
                            <button className="btn btn-default expand"
                                    onClick={this.onCollapse.bind(this)}>
                                <span className="glyph"><span className="glyphicon glyphicon-triangle-bottom"></span></span>
                            </button>
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
                    <div className="right-action-group"
                        ref={(c) => this.rightActions = c}>
                        <button className="right-action btn btn-warning"
                                onClick={this.onDuplicate.bind(this)}>
                            <span className="glyphicon glyphicon-duplicate"/>
                        </button>
                        <button className="right-action btn btn-danger"
                                onClick={this.onDelete.bind(this)}>
                            <span className="glyphicon glyphicon-trash"/>
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="task-narrow-expanded">
                <div className={"panel panel-" + (active ? "primary" : "default")}
                     onTouchStart={this.onTouchStart.bind(this)}
                     onTouchMove={this.onTouchMove.bind(this)}
                     onTouchEnd={this.onTouchEnd.bind(this)}
                     onTouchCancel={this.onTouchCancel.bind(this)}
                     ref={(c) => this.taskPanel = c}>
                    <div className={"inside bg-" + (category ? category.css : "default")}>
                        <Complete.Narrow task={task} onComplete={this.onComplete.bind(this)} onPause={this.onPause.bind(this)}/>
                        <Play.Component task={task} onPlay={this.onPlay.bind(this)} onPause={this.onPause.bind(this)}/>
                        <label className="label-title">Title:</label>
                        <button className="btn btn-default expand"
                                onClick={this.onCollapse.bind(this)}>
                            <div className="glyph"><span className="glyphicon glyphicon-triangle-top"></span></div>
                        </button>
                        <HtmlEditor.Component
                            className="title"
                            singleLine={true}
                            html={this.props.task.title}
                            onSuccess={this.onTitleChange.bind(this)}
                            onCancel={this.onTitleChange.bind(this)}
                        />
                        <label className="label-subject">Subject:</label>
                        <HtmlEditor.Component
                             className="subject"
                             singleLine={false}
                             html={this.props.task.subject}
                             onSuccess={this.onSubjectChange.bind(this)}
                             onCancel={this.onSubjectChange.bind(this)}
                        />
                        <label className="label-category">Context:</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.context}
                            onSuccess={this.onContextChange.bind(this)}
                            onCancel={this.onContextChange.bind(this)}
                        />
                        <label className="label-category">Category:</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.category}
                            onSuccess={this.onCategoryChange.bind(this)}
                            onCancel={this.onCategoryChange.bind(this)}
                        />
                        <label className="label-category">Project:</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.project}
                            onSuccess={this.onProjectChange.bind(this)}
                            onCancel={this.onProjectChange.bind(this)}
                        />
                        <label className="label-category">Story:</label>
                        <HtmlEditor.Component
                            className="category"
                            singleLine={true}
                            html={this.props.task.story}
                            onSuccess={this.onStoryChange.bind(this)}
                            onCancel={this.onStoryChange.bind(this)}
                        />
                        <label className="label-category">Schedule:</label>
                        <div className="input-group">
                            <span className="input-group-btn">
                                <button className="btn btn-primary"
                                        onClick={this.onScheduledNextDay.bind(this)}>
                                    <b>+1</b>
                                </button>
                                <button className="btn btn-primary"
                                        onClick={this.onScheduledNextWeek.bind(this)}>
                                    <b>+7</b>
                                </button>
                                <button className="btn btn-primary"
                                        onClick={this.onScheduledNextMonth.bind(this)}>
                                    <b>+30</b>
                                </button>
                            </span>
                            <input  type="datetime-local"
                                    className="form-control"
                                    value={TextUtil.formatInputDateTimeLocal(this.props.task.scheduled, false)}
                                    onChange={this.onScheduledChange.bind(this)}
                            />
                        </div>
                        <div className="duration" >
                            <Timer.Component active={active} from={from} plus={plus} onClick={this.onCollapse.bind(this)}/>
                            <label className="label-duration">Duration:</label>
                            {duration}
                        </div>
                        <div className="delete">
                            <button className="btn btn-danger"
                                    ref={(c) => this.rightActions = c}
                                    onClick={this.onDelete.bind(this)}>
                                <span className="glyphicon glyphicon-trash"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    public onScheduledNextDay(ev) {
        super.onScheduledNextDay(ev);
        this.animateSlidePos(0);
    }

    public onScheduledNextWeek(ev) {
        super.onScheduledNextWeek(ev);
        this.animateSlidePos(0);
    }

    public onScheduledNextMonth(ev) {
        super.onScheduledNextMonth(ev);
        this.animateSlidePos(0);
    }

    public onScheduledChange(ev) {
        super.onScheduledChange(ev.target.value);
    }
    public onDelete(ev) {
        this.setSlidePos(0);
        super.onDelete(ev);
    }
    public onDuplicate(ev) {
        this.setSlidePos(0);
        super.onDuplicate(ev);
    }
    public onCollapse(ev: React.SyntheticEvent<any>) {
        ev.preventDefault();
        console.log("onCollapse");
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    public onTouchStart(ev: React.TouchEvent<any>) {
        this.props.onSlide(this,false);
        //console.log("onTouchStart – SY: " + ev.touches[0].screenY + ", PY: " + ev.touches[0].pageY + ", CY: " + ev.touches[0].clientY);
        if (ev.touches.length != 1) {
            this.touchIntention = TouchIntention.DONT_CARE;
            return true;
        }

        this.initialTouch = this.lastTouch = $.extend({}, ev.touches[0]);
        this.initialTouchTime = new Date();
        this.touchIntention = TouchIntention.UNKNOWN;
        return true;
    }
    public onTouchMove(ev: React.TouchEvent<any>) {
        //console.log("onTouchMove – SY: " + ev.touches[0].screenY + ", PY: " + ev.touches[0].pageY + ", CY: " + ev.touches[0].clientY);
        if (!this.checkTouch(ev))
            return true;

        this.lastTouch = $.extend({}, ev.touches[0]);
        var slide = this.lastTouch.screenX - this.initialTouch.screenX;
        slide = Math.max(SLIDE_RIGHT_MIN, Math.min(SLIDE_LEFT_MAX, slide));
        this.setSlidePos(slide);

        return true;
    }
    public onTouchEnd(ev: React.TouchEvent<any>) {
        //console.log("onTouchEnd – SY: " + ev.touches[0].screenY + ", PY: " + ev.touches[0].pageY + ", CY: " + ev.touches[0].clientY);
        if (this.initialTouch == null)
            return true;

        var slide = this.lastTouch.pageX - this.initialTouch.pageX;
        if (slide > SLIDE_LEFT_MAX*1/2) {
            this.animateSlidePos(SLIDE_LEFT);
            this.props.onSlide(this, true);
        } else if (slide < SLIDE_RIGHT_MIN*1/2) {
            this.animateSlidePos(SLIDE_RIGHT);
            this.props.onSlide(this, true);
        } else {
            this.animateSlidePos(0);
        }

        this.resetTouch();
        return true;
    }
    public onTouchCancel(ev: React.TouchEvent<any>) {
        if (this.initialTouch == null)
            return true;

        this.setSlidePos(0);
        this.resetTouch();
        return true;
    }

    public checkTouch(ev: React.TouchEvent<any>) {
        if (this.initialTouch == null || this.touchIntention == TouchIntention.DONT_CARE)
            return false;

        if (ev.touches.length != 1) {
            this.touchIntention = TouchIntention.DONT_CARE;
            this.animateSlidePos(0);
            this.resetTouch();
            return false;
        }
        if (this.touchIntention == TouchIntention.SLIDE)
            return true;

        var touch = ev.touches[0];
        var deltaY = Math.abs(touch.clientY - this.initialTouch.clientY);
        var deltaX = Math.abs(touch.screenX - this.initialTouch.screenX);
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

    public resetTouch() {
        this.initialTouch = null;
        this.initialTouchTime = null;
        this.lastTouch = null;
        this.touchIntention = TouchIntention.UNKNOWN
    }

    public setSlidePos(pos :number) {
        this.leftActions.style.left = (pos - SLIDE_LEFT) + 'px';
        this.taskPanel.style.left = pos + 'px';
        this.rightActions.style.right = (-pos + SLIDE_RIGHT) + 'px';
    }

    public animateSlidePos(pos :number) {
        $(this.leftActions).animate({left: (pos - SLIDE_LEFT) + 'px'}, 500);
        $(this.taskPanel).animate({left: pos + 'px'}, 500);
        $(this.rightActions).animate({right: (-pos + SLIDE_RIGHT) + 'px'}, 500);
    }
};
