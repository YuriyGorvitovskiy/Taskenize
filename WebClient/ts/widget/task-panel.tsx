import * as $ from 'jquery';
import * as Moment from 'moment';
import * as React from 'react';
import * as Model from '../model/task';
import * as Calendar from './calendar-button';
import * as HtmlEditor from './html-editor';
import * as Timer from './task-timer';
import * as TextInput from './text-editor';
import * as TextUtil from '../util/text';

export interface Props extends React.Props<Component> {
    task: Model.Task;
    onActivate: (task: Model.Task, activate: boolean) => any;
    onDelete: (task: Model.Task) => any;
};

interface State {
}

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {
        }
    }

    public _componentDidMount() {
        var schedule_btn_id = "#schedule-btn-id-" + this.props.task._id;
        var schedule_cal_id = "#schedule-cal-id-" + this.props.task._id;

        var item: any = $(schedule_btn_id);
        item.popover();
        item.on('inserted.bs.popover', () => {
            var picker: any = $(schedule_cal_id);
            picker.datepicker({
                startDate: new Date(),
                todayBtn: true,
                todayHighlight: true
            });
        });
    }

    public render() {
        var active = this.props.task.state == Model.State.RUNNING;
        var completed = this.props.task.state == Model.State.COMPLETED;
        var category = Model.Category.MAP[this.props.task.category];

        var css = category ? category.css : 'default';
        var collapsed = this.props.task.collapsed;
        var taskId = this.props.task._id;

        var durations = [];
        $.each(this.props.task.duration, (index: number, period: Model.Period) => {
            var fromPart = (
                <TextInput.Component
                     className="form-control text-center"
                     text={TextUtil.formatDate(period.begin, true)}
                     placeholder="YYYY/MM/DD HH:MM:SS"
                     onSuccess={this.onDurationBeginChange.bind(this, index)} />
            );
            var toPart;
            var timePart;
            var actionPart;
            if (period.end == null) {
                toPart = (
                    <input
                        type="text"
                        className="form-control text-center"
                        readOnly={true}
                        value="in progress"/>
                );
                timePart = (
                    <input
                        type="text"
                        className="form-control text-center"
                        readOnly={true}
                        value="..."/>
                );
                actionPart = (<div className="input-group-addon btn-blank">&nbsp;</div>);
            } else {
                 toPart = (
                    <TextInput.Component
                         className="form-control text-center"
                         text={TextUtil.formatDate(period.end, true)}
                         placeholder="YYYY/MM/DD HH:MM:SS"
                         onSuccess={this.onDurationEndChange.bind(this, index)} />
                 );
                 timePart = (
                     <input
                        type="text"
                        className="form-control text-center"
                        readOnly={true}
                        value={TextUtil.formatPeriod(period.begin, period.end)}/>
                );
                actionPart = (
                    <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={this.onDeletePeriod.bind(this,index)}>
                            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </span>
                );
            }

            durations.push(
                <div className="input-group" key={index} >
                    {fromPart}
                    <div className="input-group-addon">to</div>
                    {toPart}
                    <div className="input-group-addon">took</div>
                    {timePart}
                    {actionPart}
                </div>
            );
        });
        var duration : any = ""
        if (durations.length > 0) {
            duration =(
                <div className="form-group col-sm-12">
                    <label className="control-label">Duration</label>
                    {durations}
                </div>
            );
        }
        var schedule_btn_id = "schedule-btn-id-" + this.props.task._id;
        var schedule_cal_id = "schedule-cal-id-" + this.props.task._id;

        return (
            <div className={"task panel panel-" + (active ? "primary" : css)}>
                <div className="panel-heading">
                    <div className="input-group">
                        <span className="input-group-btn">
                            <button type="button" className="btn btn-success task-checked" onClick={this.onComplete.bind(this,!completed)}>
                                <span className={"glyphicon glyphicon-" + (completed ? "check" : "unchecked")} aria-hidden="true"></span>
                            </button>
                        </span>
                        <HtmlEditor.Component
                            className="task-title text-nowrap"
                            singleLine={true}
                            html={this.props.task.title}
                            onSuccess={this.onTitleChange.bind(this)}
                            onCancel={this.onTitleChange.bind(this)}
                         />
                        <span className="input-group-btn">
                            <button type="button" className="btn btn-default task-timer" onClick={this.onCollapse.bind(this, !collapsed)}>
                                <span className="glyphicon glyphicon-info-sign"></span>&nbsp;<Timer.Component task={this.props.task} />
                            </button>
                            <button type="button" className={active ? "btn btn-danger" : "btn btn-primary"} onClick={()=>this.props.onActivate(this.props.task,!active)}>
                                <span className={active ? "glyphicon glyphicon-pause" : "glyphicon glyphicon-play"} aria-hidden="true"></span>
                            </button>
                        </span>
                    </div>
                </div>
                <div className={"panel-collapse collapse" + (collapsed ? "" : " in")} >
                    <div className="panel-body">
                        <div className="form-group col-md-3">
                            <label className="control-label">Context</label>
                            <TextInput.Component
                                 className="form-control"
                                 text={this.props.task.context}
                                 placeholder="Context..."
                                 onSuccess={this.onContextChange.bind(this)} />
                        </div>
                        <div className="form-group col-md-3">
                            <label className="control-label">Category</label>
                            <TextInput.Component
                                 className="form-control"
                                 text={this.props.task.category}
                                 placeholder="Category..."
                                 onSuccess={this.onCategoryChange.bind(this)} />
                        </div>
                        <div className="form-group col-md-3">
                            <label className="control-label">Project</label>
                            <TextInput.Component
                                 className="form-control"
                                 text={this.props.task.project}
                                 placeholder="Project..."
                                 onSuccess={this.onProjectChange.bind(this)} />
                        </div>
                        <div className="form-group col-md-3">
                            <label className="control-label">Story</label>
                            <TextInput.Component
                                 className="form-control"
                                 text={this.props.task.story}
                                 placeholder="Story..."
                                 onSuccess={this.onStoryChange.bind(this)} />
                        </div>
                        <div className="form-group col-sm-12">
                            <label className="control-label">Subject</label>
                            <HtmlEditor.Component
                                className="task-subject form-control"
                                singleLine={false}
                                html={this.props.task.subject}
                                onSuccess={this.onSubjectChange.bind(this)}
                                onCancel={this.onSubjectChange.bind(this)}
                             />
                        </div>
                        {duration}
                    </div>
                    <div className={"panel-footer"} >
                        <div className={"input-group bg-" + css}>
                            <div className="input-group-btn" >
                                <button className="btn btn-default" type="button" onClick={()=>this.props.onDelete(this.props.task)}>
                                    <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                </button>
                            </div>
                            <span className="input-group-addon spacer">&nbsp;</span>
                            <div className="input-group">
                                <span className="input-group-btn">
                                    <Calendar.Component
                                        id={this.props.task._id}
                                        date={this.props.task.scheduled}
                                        onChange={this.onScheduledCalendarChange.bind(this)}
                                    />
                                </span>
                                <TextInput.Component
                                     className="form-control text-center schedule"
                                     text={TextUtil.formatDate(this.props.task.scheduled, false)}
                                     placeholder="Scheduled..."
                                     onSuccess={this.onScheduledChange.bind(this)} />
                                <span className="input-group-btn">
                                    <button className="btn btn-default" type="button" onClick={()=>this.onScheduledNextDay()}>+1</button>
                                    <button className="btn btn-default" type="button" onClick={()=>this.onScheduledNextWeek()}>+7</button>
                                    <button className="btn btn-default" type="button" onClick={()=>this.onScheduledNextMonth()}>+30</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    public onComplete(toComplete: boolean) {
        this.props.task.state = toComplete ? Model.State.COMPLETED : Model.State.PAUSED;
        this.forceUpdate();
        Model.updateState(this.props.task);
    }

    public onCollapse(toCollapse: boolean) {
        this.props.task.collapsed = toCollapse;
        this.forceUpdate();
        Model.updateCollapsed(this.props.task);
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

    public onScheduledNextDay() {
        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({days:1})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    public onScheduledNextWeek() {
        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({days:7})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    public onScheduledNextMonth() {
        this.props.task.scheduled = Moment(this.props.task.scheduled || new Date())
            .add({months:1})
            .toDate();

        this.forceUpdate();
        Model.updateScheduled(this.props.task);
    }

    public onDeletePeriod(index: number) {
        this.props.task.duration.splice(index, 1);
        this.forceUpdate();
        Model.deleteDuration(this.props.task, index);
    }

};
