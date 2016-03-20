import * as $ from 'jquery';
import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as Complete from './complete-button';
import * as Play from './timer-button-narrow';
import * as Timer from './timer';
import * as HtmlEditor from './html-editor';
import * as TaskCommon from './task-common';


const TOUCH_TOLERANCE = 32;
const SLIDE_LEFT = 64;
const SLIDE_RIGHT = -64;
const SLIDE_LEFT_MAX  = 72;
const SLIDE_RIGHT_MIN  = -72;

export class Component extends TaskCommon.Component {
    leftActions : any;
    taskPanel: any;
    rightActions : any;

    initialTouch : React.Touch;
    lastTouch : React.Touch;

    public constructor() {
        super();
    }

    public render() {
        var task = this.props.task;
        var active = (task.state == Model.State.RUNNING);
        var category = Model.Category.MAP[task.category];
        var plus = Model.calculateCompletedDuration(this.props.task);
        var from = active ? Moment(this.props.task.duration[0].begin) : null;

        return (
            <div className="task-narrow">
                <button className="left-action btn btn-primary"
                        ref={(c) => this.leftActions = c}
                        onClick={this.onScheduledNextDay.bind(this)}>
                    <b>+1</b>
                </button>
                <div className={"panel panel-" + (active ? "primary" : "default")}
                     onTouchStart={this.onTouchStart.bind(this)}
                     onTouchMove={this.onTouchMove.bind(this)}
                     onTouchEnd={this.onTouchEnd.bind(this)}
                     onTouchCancel={this.onTouchCancel.bind(this)}
                     ref={(c) => this.taskPanel = c}>
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
                <button className="right-action  btn btn-danger"
                        ref={(c) => this.rightActions = c}
                        onClick={this.onDelete.bind(this)}>
                    <span className="glyphicon glyphicon-trash"/>
                </button>
            </div>
        );
    }

    public onScheduledNextDay(ev) {
        super.onScheduledNextDay(ev);
        this.animateSlidePos(0);
    }
    public onDelete(ev) {
        this.setSlidePos(0);
        super.onDelete(ev);
    }
    public onTouchStart(ev: React.TouchEvent) {
        if (ev.touches.length != 1)
            return true;

        this.initialTouch = this.lastTouch = $.extend({}, ev.touches[0]);
        return true;
    }
    public onTouchMove(ev: React.TouchEvent) {
        if (!this.checkTouch(ev))
            return true;

        this.lastTouch = $.extend({}, ev.touches[0]);
        var slide = this.lastTouch.pageX - this.initialTouch.pageX;
        slide = Math.max(SLIDE_RIGHT_MIN, Math.min(SLIDE_LEFT_MAX, slide));
        this.setSlidePos(slide);

        return true;
    }
    public onTouchEnd(ev: React.TouchEvent) {
        if (this.initialTouch == null)
            return true;

        var slide = this.lastTouch.pageX - this.initialTouch.pageX;
        if (slide > SLIDE_LEFT_MAX/3)
            this.animateSlidePos(SLIDE_LEFT);
        else if (slide < SLIDE_RIGHT_MIN/3)
            this.animateSlidePos(SLIDE_RIGHT);
        else
            this.animateSlidePos(0);

        this.resetTouch();
        return true;
    }
    public onTouchCancel(ev: React.TouchEvent) {
        if (this.initialTouch == null)
            return true;

        this.setSlidePos(0);
        this.resetTouch();
        return true;
    }

    public checkTouch(ev: React.TouchEvent) {
        if (this.initialTouch == null)
            return false;
        if (ev.touches.length != 1) {
            this.animateSlidePos(0);
            this.resetTouch();
            return false;
        }
        var touch = ev.touches[0];
        if (Math.abs(touch.pageY - this.initialTouch.pageY) > TOUCH_TOLERANCE) {
            this.animateSlidePos(0);
            this.resetTouch();
            return false;
        }
        return true;
    }

    public resetTouch() {
        this.initialTouch = null;
        this.lastTouch = null;
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
