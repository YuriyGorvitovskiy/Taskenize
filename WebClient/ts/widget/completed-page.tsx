import * as Moment from "moment";
import * as React from "react";

import * as TaskNarrow from "./task-narrow";
import * as TaskWide from "./task-wide";

import * as Report from "../model/report";
import * as Model from "../model/task";
import * as StyleUtil from "../util/style";

const anchorLabel: {[key: number]: string} = {};
anchorLabel[Report.Anchor.NOW] = "Up to now";
anchorLabel[Report.Anchor.CURRENT] = "Current";
anchorLabel[Report.Anchor.LAST] = "Last";

const rangeLabel: {[key: number]: string} = {};
rangeLabel[Report.Range.DAY] = "Day";
rangeLabel[Report.Range.WEEK] = "Week";
rangeLabel[Report.Range.MONTH] = "Month";

const propertyLabel: {[key: number]: string} = {};
propertyLabel[Report.Property.COMPLETED_TIME] = "Completed Time";
propertyLabel[Report.Property.CONTEXT] = "Context";
propertyLabel[Report.Property.CATEGORY] = "Category";
propertyLabel[Report.Property.PROJECT] = "Project";
propertyLabel[Report.Property.STORY] = "Story";
propertyLabel[Report.Property.TASK] = "Task";

interface IState {
    anchor: Report.Anchor;
    range: Report.Range;
    orderBy: Report.Property;
    tasks: Model.ITask[];
    uncomplettedTasks: Model.ITask[];
}

export class Component extends React.Component<{}, IState> {
    protected slidedTaskPanel: TaskNarrow.Component = null;

    public constructor() {
        super();
        this.requestTasks(Report.Anchor.NOW, Report.Range.WEEK, Report.Property.COMPLETED_TIME);
    }

    public render() {
        const env = StyleUtil.findBootstrapEnvironment();
        const full = (env === "md" || env === "lg");
        const anchor = anchorLabel[this.state.anchor];
        const range = rangeLabel[this.state.range];
        const orderBy = propertyLabel[this.state.orderBy];

        const panels = [];
        const groupNamer = Model.getGroupNamer(this.state.orderBy);
        let prevGroupName = "";
        $.each(this.state.tasks, (index: number, task: Model.ITask) => {
            const nextGroupName = groupNamer(task);
            if (prevGroupName !== nextGroupName) {
                panels.push((
                    <h1 key={"g" + index}>{nextGroupName}</h1>
                ));
                prevGroupName = nextGroupName;
            }
            if (full) {
                panels.push((
                    <TaskWide.Component
                        key={index}
                        task={task}
                        requestUncompletedTasks={this.requestUncompletedTasks}
                        onStateChange={this.onStateChange}
                        onDuplicate={this.onDuplicate}
                        onDelete={this.onDelete}
                        onSlide={this.onSlide}
                    />
                ));
            } else {
                panels.push((
                    <TaskNarrow.Component
                        key={index}
                        task={task}
                        requestUncompletedTasks={this.requestUncompletedTasks}
                        onStateChange={this.onStateChange}
                        onDuplicate={this.onDuplicate}
                        onDelete={this.onDelete}
                        onSlide={this.onSlide}
                    />
                ));
            }
        });

        return (
            <div className="container" onTouchStart={this.onTouchStart}>
                <div className="row">
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button
                                type="button"
                                className="col-xs-12 btn btn-info dropdown-toggle"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                {anchor}
                                <span className="caret"/>
                            </button>
                            <ul className="dropdown-menu">
                                {this.renderAnchorMenuItem(Report.Anchor.NOW)}
                                {this.renderAnchorMenuItem(Report.Anchor.CURRENT)}
                                {this.renderAnchorMenuItem(Report.Anchor.LAST)}
                            </ul>
                        </div>
                    </div>
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button
                                type="button"
                                className="col-xs-12 btn btn-primary dropdown-toggle"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                {range}
                                <span className="caret" />
                            </button>
                            <ul className="dropdown-menu">
                                {this.renderRangeMenuItem(Report.Range.DAY)}
                                {this.renderRangeMenuItem(Report.Range.WEEK)}
                                {this.renderRangeMenuItem(Report.Range.MONTH)}
                            </ul>
                        </div>
                    </div>
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button
                                type="button"
                                className="col-xs-12 btn btn-success dropdown-toggle"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                {orderBy}
                                <span className="caret" />
                            </button>
                            <ul className="dropdown-menu">
                                {this.renderPropertyMenuItem(Report.Property.COMPLETED_TIME)}
                                {this.renderPropertyMenuItem(Report.Property.CONTEXT)}
                                {this.renderPropertyMenuItem(Report.Property.CATEGORY)}
                                {this.renderPropertyMenuItem(Report.Property.PROJECT)}
                                {this.renderPropertyMenuItem(Report.Property.STORY)}
                                {this.renderPropertyMenuItem(Report.Property.TASK)}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="row"><br/></div>
                <div className="row">
                    <div className="panel-group" id="execution-tasks">
                        {panels}
                    </div>
                </div>
            </div>
        );
    }

    public renderAnchorMenuItem(anchor: Report.Anchor) {
        return (
            <li>
                <a
                    href="#"
                    // tslint:disable-next-line:jsx-no-lambda
                    onClick={(ev) => this.onAnchorClick(anchor, ev)}
                >
                    {anchorLabel[anchor]}
                </a>
            </li>
        );
    }

    public renderRangeMenuItem(range: Report.Range) {
        return (
            <li>
                <a
                    href="#"
                    // tslint:disable-next-line:jsx-no-lambda
                    onClick={(ev) => this.onRangeClick(range, ev)}
                >
                    {rangeLabel[range]}
                </a>
            </li>
        );
    }

    public renderPropertyMenuItem(property: Report.Property) {
        return (
            <li>
                <a
                    href="#"
                    // tslint:disable-next-line:jsx-no-lambda
                    onClick={(ev) => this.onPropertyClick(property, ev)}
                >
                    {propertyLabel[property]}
                </a>
            </li>
        );
    }

    public onStateChange = (task: Model.ITask, newState: Model.State) => {
        task.state = newState;
        Model.updateState(task)
            .then((changedTasks: Model.ITask[]) => {
                const tasks = [];
                this.state.tasks.forEach((oldTask) => {
                    const changedTask = changedTasks.filter((t) => (oldTask._id === t._id))[0];
                    tasks.push(changedTask || oldTask);
                });
                this.setState({
                    tasks,
                });
            });
    }

    public onTouchStart = (ev: React.TouchEvent<any>) => {
        this.onSlide(null, false);
        return true;
    }

    public onDuplicate = (task: Model.ITask) => {
        Model.postNew({
            category: task.category,
            collapsed: true,
            completed_time: null,
            context: task.context,
            created_time: new Date(),
            duration: [],
            project: task.project,
            scheduled: null,
            state: Model.State.PAUSED,
            story: task.story,
            subject: task.subject,
            title:   task.title,
        }).then((newTask: Model.ITask) => {
            const tasks = Model.insertAfterTask(this.state.tasks, task, newTask);
            this.setState({
                tasks,
            });
        });
    }

    public onDelete = (task: Model.ITask) => {
        Model.del(task._id)
            .then((deletedTask: Model.ITask) => {
                const tasks = this.state.tasks.filter((t: Model.ITask) => {
                    return t._id !== deletedTask._id;
                });
                this.setState({
                    tasks,
                });
            });
    }

    public onSlide = (taskPanel: TaskNarrow.Component, slided: boolean) => {
        if (this.slidedTaskPanel !== taskPanel && this.slidedTaskPanel != null) {
            this.slidedTaskPanel.animateSlidePos(0);
        }
        this.slidedTaskPanel = slided ? taskPanel : null;
    }

    public onAnchorClick = (anchor: Report.Anchor, ev: React.MouseEvent<any>) => {
        ev.preventDefault();
        this.requestTasks(anchor, this.state.range, this.state.orderBy);
    }

    public onRangeClick = (range: Report.Range, ev: React.MouseEvent<any>) => {
        ev.preventDefault();
        this.requestTasks(this.state.anchor, range, this.state.orderBy);
    }

    public onPropertyClick = (orderBy: Report.Property, ev: React.MouseEvent<any>) => {
        ev.preventDefault();
        const tasks = this.state.tasks.slice();
        tasks.sort(Model.getComparator(orderBy));
        this.setState({
            orderBy,
            tasks,
        });

        this.requestTasks(this.state.anchor, this.state.range, orderBy);
    }

    public requestUncompletedTasks = (callback: (uncompletedTasks: Model.ITask[]) => any) => {
        if (this.state.uncomplettedTasks != null) {
            callback(this.state.uncomplettedTasks);
            return;
        }
        Model.getExecuting().done(((serverTasks) => {
            const tasks = serverTasks as Model.ITask[];
            tasks.sort(Model.executionComparator);
            this.setState({uncomplettedTasks: tasks});
            callback(tasks);
        }));
    }

    public requestTasks(anchor: Report.Anchor, range: Report.Range, orderBy: Report.Property) {
        const newState: IState = {
            anchor,
            orderBy,
            range,
            tasks: [],
            uncomplettedTasks: null,
        };
        if (this.state == null) {
            this.state = newState;
        } else {
            this.setState(newState);
        }

        Model.getCompleted(Report.calculatePeriod(anchor, range)).done(((serverTasks) => {
            const tasks = serverTasks as Model.ITask[];
            tasks.sort(Model.getComparator(orderBy));
            this.setState({
                tasks,
            });
        }));
    }

}
