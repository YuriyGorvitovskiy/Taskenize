import * as Moment from "moment";
import * as React from "react";

import * as TaskNarrow from "./task-narrow";
import * as TaskWide from "./task-wide";

import * as Model from "../model/task";
import * as StyleUtil from "../util/style";

interface IState {
    tasks: Model.ITask[];
}

export class ExecutionPage extends React.Component<{}, IState> {
    protected slidedTaskPanel: TaskNarrow.Component = null;

    public constructor() {
        super();
        this.state = {
            tasks: [],
        };

        Model.getExecuting().done(((serverTasks) => {
            const tasks = serverTasks as Model.ITask[];
            tasks.sort(Model.executionComparator);
            this.setState({tasks});
        }));
    }

    public render() {
        const env = StyleUtil.findBootstrapEnvironment();
        const full = (env === "md" || env === "lg");

        const actions = [];
        $.each(Model.Category.COMMON, (index: number, category: Model.Category) => {
            actions.push((
                <button
                    key={index}
                    type="button"
                    className={"col-xs-2 btn btn-" + category.css}
                    // tslint:disable-next-line:jsx-no-lambda
                    onClick={() => this.onNewTask(category)}
                >
                    <span className={"glyphicon glyphicon-" + category.glyph} />
                    {full ? " " + category.name : ""}
                </button>
            ));
        });
        const panels = [];
        const tomorrow = Moment().add(1, "days").startOf("day");
        let nextDate = tomorrow;
        $.each(this.state.tasks, (index: number, task: Model.ITask) => {
            if (nextDate.isBefore(task.scheduled)) {
                nextDate = Moment(task.scheduled).startOf("day");
                panels.push((
                    <h1 key={"d" + index}>{tomorrow.isSame(nextDate) ? "Tomorrow" : nextDate.format("ddd D MMMM")}</h1>
                ));
                nextDate = nextDate.add(1, "days");
            }
            if (full) {
                panels.push((
                    <TaskWide.Component
                        key={index}
                        task={task}
                        // tslint:disable-next-line:jsx-no-lambda
                        requestUncompletedTasks={(callback) => callback(this.state.tasks)}
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
                        // tslint:disable-next-line:jsx-no-lambda
                        requestUncompletedTasks={(callback) => callback(this.state.tasks)}
                        onStateChange={this.onStateChange}
                        onDuplicate={this.onDuplicate}
                        onDelete={this.onDelete}
                        onSlide={this.onSlide}
                    />
                ));
            }
        });

        return (
            <div className="container"  onTouchStart={this.onTouchStart}>
                <div className="row">
                    {actions}
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

    public onNewTask(category: Model.Category) {
        Model.postNew({
            category: category.name,
            collapsed: false,
            completed_time: null,
            context: "",
            created_time: new Date(),
            duration: [],
            project: "",
            scheduled: null,
            state: Model.State.PAUSED,
            story: "",
            subject: "",
            title:   category.title,
        }).then((task: Model.ITask) => {
            const tasks = [task].concat(this.state.tasks);
            this.setState({tasks});
            if (category.autorun) {
                this.onStateChange(task, Model.State.RUNNING);
            }
        });
    }

    public onTouchStart = (ev: React.TouchEvent<any>) => {
        this.onSlide(null, false);
        return true;
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
                tasks.sort(Model.executionComparator);
                this.setState({tasks});
            });
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
            title: task.title,
        }).then((newTask: Model.ITask) => {
            const tasks = Model.insertAfterTask(this.state.tasks, task, newTask);
            this.setState({tasks});
        });
    }

    public onDelete = (task: Model.ITask) => {
        Model.del(task._id)
            .then((deletedTask: Model.ITask) => {
                const tasks = this.state.tasks.filter((t: Model.ITask) => {
                    return t._id !== deletedTask._id;
                });
                this.setState({tasks});
            });
    }

    public onSlide = (taskPanel: TaskNarrow.Component, slided: boolean) => {
        if (this.slidedTaskPanel !== taskPanel && this.slidedTaskPanel != null) {
            this.slidedTaskPanel.animateSlidePos(0);
        }
        this.slidedTaskPanel = slided ? taskPanel : null;
    }
}
