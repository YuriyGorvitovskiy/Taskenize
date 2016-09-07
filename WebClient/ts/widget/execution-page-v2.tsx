import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Moment from 'moment';

import * as Nav from './navigation-bar-v2';
import * as TaskPanel    from './task-panel-v2';
import * as TaskProperty from './task-property-v2';
import * as TaskDuration from './task-duration-v2';
import * as Model from '../model/task';

class State {
    tasks: Model.Task[];
    selected: Model.Task;
    edit: boolean;
}

class Props {
    onPageSelected : (pageId : Nav.PageId) => any
}

export class Component extends React.Component<Props,State> {
    selected: TaskPanel.Component;

    public constructor() {
        super();
        this.selected = null;
        this.state = {
            tasks: [],
            selected: null,
            edit: false
        };

        Model.getExecuting().done(((serverTasks) => {
            var tasks = serverTasks as Model.Task[];
            tasks.sort(Model.executionComparator);
            this.setState({tasks, selected: tasks[0], edit: false});
        }).bind(this));
    }

    public render() {
        var panels = [];
        var tomorrow = Moment().add(1,'days').startOf('day');
        var nextDate = tomorrow;
        $.each(this.state.tasks, (index: number, task: Model.Task) => {
            if (nextDate.isBefore(task.scheduled)) {
                nextDate = Moment(task.scheduled).startOf('day');
                panels.push(
                    <header key={"d"+index} >
                        <span className="tz-title">{tomorrow.isSame(nextDate) ? 'Tomorrow' : nextDate.format('ddd D MMMM')}</span>
                    </header>
                );
                nextDate = nextDate.add(1, 'days');
            }
            panels.push(<TaskPanel.Component
                    key={index}
                    task={task}
                    selected={this.state.selected == task}
                    ref={this.state.selected == task ? (ref) => this.selected = ref : null}
                    onClick={this.onTaskSelected.bind(this, task)}
                    onStateChange={this.onTaskStateChange.bind(this, task)} />);
        });

        return (
            <div className={"tz-page" + (this.state.edit ? " tz-edit" : "")}>
                <Nav.Component
                    active={Nav.PageId.EXECUTION}
                    back={this.state.edit ? "Tasks" : null}
                    onPage={this.onPageSelected.bind(this)}
                    onBack={this.onBack.bind(this)}/>
                <aside>
                    <TaskProperty.Component task={this.state.selected}
                            onChange={this.onTaskChange.bind(this, this.state.selected)} />
                    <TaskDuration.Component task={this.state.selected}
                            onChange={this.onTaskChange.bind(this, this.state.selected)}
                            onDelete={this.onTaskDelete.bind(this, this.state.selected)} />
                </aside>
                <main className="tz-task-list" >
                    {panels}
                </main>
            </div>
        );
    }

    public componentDidUpdate() {
        if (this.selected != null) {
            var domNode = ReactDOM.findDOMNode(this.selected);
            domNode['scrollIntoViewIfNeeded'](false);
        }
    }

    public onPageSelected(page: Nav.PageId) {
        this.props.onPageSelected(page);
    }

    public onBack() {
        this.setState({
            tasks: this.state.tasks,
            selected: this.state.selected,
            edit: false
        });
    }

    public onTaskSelected(task: Model.Task) {
        this.setState({
            tasks: this.state.tasks,
            selected: task,
            edit: true
        });
    }

    public onTaskStateChange(task: Model.Task, state: Model.State) {
        Model.updateState(task, state)
            .then((changedTasks: Model.Task[]) => {
                var tasks = [];
                var selected = this.state.selected;
                this.state.tasks.forEach((oldTask) => {
                    var changedTask = changedTasks.filter((changedTask) => (oldTask._id==changedTask._id))[0];
                    tasks.push(changedTask || oldTask);
                    if (changedTask && selected && selected._id == changedTask._id)
                        selected = changedTask;
                })
                tasks.sort(Model.executionComparator);
                this.setState({
                    tasks,
                    selected,
                    edit: this.state.edit
                });
            });

        this.setState({
            tasks: this.state.tasks,
            selected: task,
            edit: this.state.edit
        });
    }

    public onTaskChange(changedTask: Model.Task, serverTask: Model.Task) {
        var tasks = [];
        var selected = this.state.selected;
        this.state.tasks.forEach((task) => {
            if (task._id == serverTask._id)
                task = serverTask;
            if (selected != null && selected._id == task._id)
                selected = task;
            tasks.push(task);
        });
        tasks.sort(Model.executionComparator);
        this.setState({
            tasks,
            selected,
            edit: this.state.edit
        });
    }

    public onTaskDelete(task: Model.Task) {
        if (task == null) {
            return;
        }
        var selected = null;
        var tasks = this.state.tasks;
        var index = tasks.indexOf(task);
        if (0 <= index  && index < tasks.length - 1) {
            selected = tasks[index + 1];
        } else if (0 < index  && index == tasks.length) {
            selected = tasks[index - 1];
        }

        Model.del(task._id)
            .then((task: Model.Task) => {
                var tasks = this.state.tasks.filter((_task: Model.Task) => {
                    return _task._id != task._id;
                });
                this.setState({
                    tasks,
                    selected,
                    edit: false
                });
            });
    }
}
