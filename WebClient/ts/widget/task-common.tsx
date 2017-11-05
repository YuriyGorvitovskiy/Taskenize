import * as $ from "jquery";
import * as Moment from "moment";
import * as React from "react";

import * as Model from "../model/task";
import * as TextUtil from "../util/text";

import * as Complete from "./complete-button";
import * as HtmlEditor from "./html-editor";
import * as TaskNarrow from "./task-narrow";
import * as Timer from "./timer";
import * as Play from "./timer-button-narrow";

export interface IProps extends React.Props<Component> {
    task: Model.ITask;
    onStateChange: (task: Model.ITask, newState: Model.State) => any;
    onDuplicate: (task: Model.ITask) => any;
    onDelete: (task: Model.ITask) => any;
    onSlide: (taskPanel: TaskNarrow.Component, sleded: boolean) => any;
    requestUncompletedTasks: (callback: (uncompletedTasks: Model.ITask[]) => any) => any;
}

export interface IState {
    collapsed: boolean;
}

export class Component extends React.Component<IProps, IState> {
    public constructor() {
        super();
        this.state = {
            collapsed: true,
        };
    }

    protected onComplete = () => {
        this.props.onStateChange(this.props.task, Model.State.COMPLETED);
    }

    protected onPause = () => {
        this.props.onStateChange(this.props.task, Model.State.PAUSED);
    }

    protected onPlay = () => {
        this.props.onStateChange(this.props.task, Model.State.RUNNING);
    }

    protected onDelete = (ev) => {
        ev.preventDefault();
        this.props.onDelete(this.props.task);
    }

    protected onDuplicate = (ev) => {
        ev.preventDefault();
        this.props.onDuplicate(this.props.task);
    }

    protected onTitleChange = (htmlNew: string) => {
        if (this.props.task.title === htmlNew) {
            return;
        }

        this.props.task.title = htmlNew;
        this.forceUpdate();
        Model.updateTitle(this.props.task);
    }

    protected onSubjectChange = (htmlNew: string) => {
        if (this.props.task.subject === htmlNew) {
            return;
        }

        this.props.task.subject = htmlNew;
        this.forceUpdate();
        Model.updateSubject(this.props.task);
    }

    protected onContextChange = (text: string) => {
        if (this.props.task.context === text) {
            return;
        }

        this.props.task.context = text;
        this.forceUpdate();
        Model.updateContext(this.props.task);
    }

    protected onCategoryChange = (text: string) => {
        if (this.props.task.category === text) {
            return;
        }

        this.props.task.category = text;
        this.forceUpdate();
        Model.updateCategory(this.props.task);
    }

    protected onProjectChange = (text: string) => {
        if (this.props.task.project === text) {
            return;
        }

        this.props.task.project = text;
        this.forceUpdate();
        Model.updateProject(this.props.task);
    }

    protected onStoryChange = (text: string) => {
        if (this.props.task.story === text) {
            return;
        }

        this.props.task.story = text;
        this.forceUpdate();
        Model.updateStory(this.props.task);
    }

    protected onDurationBeginChange = (index: number, text: string) => {
        if (TextUtil.formatDate(this.props.task.duration[index].begin, true) === text) {
            return;
        }

        this.props.task.duration[index].begin = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, "begin");
    }

    protected onDurationEndChange = (index: number, text: string) => {
        if (TextUtil.formatDate(this.props.task.duration[index].end, true) === text) {
            return;
        }

        this.props.task.duration[index].end = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateDuration(this.props.task, index, "end");
    }

    protected onDeletePeriod = (index: number) => {
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }
    protected onScheduledChange = (text: string) => {
        if (TextUtil.formatDate(this.props.task.scheduled, false) === text) {
            return;
        }

        this.props.task.scheduled = TextUtil.parseDate(text);
        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    protected onScheduledCalendarChange = (date: Date) => {
        this.props.task.scheduled = date;
        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    protected onScheduledNextDay = (ev) => {
        ev.preventDefault();

        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({days: 1})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    protected onScheduledNextWeek = (ev) => {
        ev.preventDefault();

        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({days: 7})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    protected onScheduledNextMonth = (ev) => {
        ev.preventDefault();

        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({months: 1})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }
}
