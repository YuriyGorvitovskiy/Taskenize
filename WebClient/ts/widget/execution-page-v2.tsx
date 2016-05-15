import * as React from 'react';
import * as Moment from 'moment';

import * as TaskPanel    from './task-panel-v2';
import * as TaskProperty from './task-property-v2';
import * as TaskDuration from './task-duration-v2';
import * as Model from '../model/task';

class State {
    tasks: Model.Task[];
}

export class Component extends React.Component<{},State> {
    public constructor() {
        super();
        this.state = {
            tasks: []
        };

        Model.getExecuting().done(((serverTasks) => {
            var tasks = serverTasks as Model.Task[];
            tasks.sort(Model.executionComparator);
            this.setState({tasks});
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
            panels.push(<TaskPanel.Component key={index} task={task} />);
        });

        return (
            <div>
                <aside>
                    <TaskProperty.Component task={null} />
                    <TaskDuration.Component task={null} />
                </aside>
                <main className="tz-task-list" >
                    {panels}
                </main>
            </div>
        );
    }
}
