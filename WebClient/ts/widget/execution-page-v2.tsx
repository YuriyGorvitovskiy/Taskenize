import * as React from 'react';
import * as Moment from 'moment';

import * as TaskPanel    from './task-panel-v2';
import * as TaskProperty from './task-property-v2';
import * as TaskDuration from './task-duration-v2';
import * as Model from '../model/task';

class State {
    tasks: Model.Task[];
    selected: Model.Task;
}

export class Component extends React.Component<{},State> {
    public constructor() {
        super();
        this.state = {
            tasks: [],
            selected: null
        };

        Model.getExecuting().done(((serverTasks) => {
            var tasks = serverTasks as Model.Task[];
            tasks.sort(Model.executionComparator);
            this.setState({tasks, selected: tasks[0]});
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
                    onClick={this.onTaskSelected.bind(this, task)}
                    onStateChange={this.onTaskStateChange.bind(this, task)} />);
        });

        return (
            <div>
                <aside>
                    <TaskProperty.Component task={this.state.selected} />
                    <TaskDuration.Component task={this.state.selected} />
                </aside>
                <main className="tz-task-list" >
                    {panels}
                </main>
            </div>
        );
    }

    public onTaskSelected(task: Model.Task) {
        this.setState({
            tasks: this.state.tasks,
            selected: task
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
                    selected
                });
            });

        this.setState({
            tasks: this.state.tasks,
            selected: task
        });
    }
}