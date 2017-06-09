import * as $ from 'jquery';
import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as Complete from './complete-button';
import * as Play from './timer-button-narrow';
import * as Timer from './timer';
import * as HtmlEditor from './html-editor';
import * as TextUtil from '../util/text';
import * as TaskNarrow from './task-narrow';

export interface Props extends React.Props<Component> {
    task: Model.Task;
    onStateChange: (task: Model.Task, newState: Model.State) => any;
    onDuplicate: (task: Model.Task) => any;
    onDelete: (task: Model.Task) => any;
    onSlide: (taskPanel: TaskNarrow.Component, sleded: boolean) => any;
    requestUncompletedTasks: (callback: (uncompletedTasks: Model.Task[])=>any) => any;
};

interface State {
    collapsed: boolean;
}

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {
            collapsed: true
        }
    }

    public onComplete() {
        this.props.onStateChange(this.props.task, Model.State.COMPLETED);
    }

    public onPause() {
        this.props.onStateChange(this.props.task, Model.State.PAUSED);
    }

    public onPlay() {
        this.props.onStateChange(this.props.task, Model.State.RUNNING);
    }

    public onDelete(ev) {
        ev.preventDefault();
        this.props.onDelete(this.props.task);
    }

    public onDuplicate(ev) {
        ev.preventDefault();
        this.props.onDuplicate(this.props.task);
    }

    public onTitleChange(htmlNew: string) {
        if (this.props.task.title == htmlNew)
            return;

        this.props.task.title = htmlNew;
        this.forceUpdate();
        Model.updateTitle(this.props.task);
    }

    public onSubjectChange(htmlNew: string) {
        if (this.props.task.subject == htmlNew)
            return;

        this.props.task.subject = htmlNew;
        this.forceUpdate();
        Model.updateSubject(this.props.task);
    }

    public onContextChange(text: string) {
        if (this.props.task.context == text)
            return;

        this.props.task.context = text;
        this.forceUpdate();
        Model.updateContext(this.props.task);
    }

    public onCategoryChange(text: string) {
        if (this.props.task.category == text)
            return;

        this.props.task.category = text;
        this.forceUpdate();
        Model.updateCategory(this.props.task);
    }

    public onProjectChange(text: string) {
        if (this.props.task.project == text)
            return;

        this.props.task.project = text;
        this.forceUpdate();
        Model.updateProject(this.props.task);
    }

    public onStoryChange(text: string) {
        if (this.props.task.story == text)
            return;

        this.props.task.story = text;
        this.forceUpdate();
        Model.updateStory(this.props.task);
    }

    public onDurationBeginChange(index: number, text: string) {
        if (TextUtil.formatDate(this.props.task.duration[index].begin, true) == text)
            return;

        this.props.task.duration[index].begin = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'begin');
    }

    public onDurationEndChange(index: number, text: string) {
        if (TextUtil.formatDate(this.props.task.duration[index].end, true) == text)
            return;

        this.props.task.duration[index].end = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, 'end');
    }

    public onDeletePeriod(index: number) {
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }
    public onScheduledChange(text: string) {
        if (TextUtil.formatDate(this.props.task.scheduled, false) == text)
            return;

        this.props.task.scheduled = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    public onScheduledCalendarChange(date: Date) {
        this.props.task.scheduled = date;
        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    public onScheduledNextDay(ev) {
        ev.preventDefault();

        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({days:1})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    public onScheduledNextWeek(ev) {
        ev.preventDefault();

        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({days:7})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    public onScheduledNextMonth(ev) {
        ev.preventDefault();

        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({months:1})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

};
