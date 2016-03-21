import * as React from 'react';
import * as Moment from 'moment';

import * as TaskWide from './task-wide';
import * as TaskNarrow from './task-narrow';
import * as Model from '../model/task';

import * as StyleUtil from '../util/style';


class ExecutionPageState {
    tasks: Model.Task[];
}

export class ExecutionPage extends React.Component<{},ExecutionPageState> {
    public constructor() {
        super();
        this.state = {
            tasks: []
        };

        Model.getAll().done(((serverTasks) => {
            var tasks = serverTasks as Model.Task[];
            tasks.sort(Model.executionComparator);
            this.setState({tasks});
        }).bind(this));
    }
    
    public render() {
        var env = StyleUtil.findBootstrapEnvironment();
        var full = (env == 'md' || env == 'lg');

        var actions = [];
        $.each(Model.Category.ALL, (index: number, category: Model.Category) => {
            actions.push(
                <button key={index} type="button" className={"col-xs-2 btn btn-" + category.css} onClick={()=>this.onNewTask(category)}>
                    <span className={"glyphicon glyphicon-" + category.glyph}></span>{full ? " " + category.name : ""}
                </button>
            );
        });
        var panels = [];
        var tomorrow = Moment().add(1,'days').startOf('day');
        var nextDate = tomorrow;
        $.each(this.state.tasks, (index: number, task: Model.Task) => {
            if (nextDate.isBefore(task.scheduled)) {
                nextDate = Moment(task.scheduled).startOf('day');
                panels.push(<h1 key={"d"+index}>{tomorrow.isSame(nextDate) ? 'Tomorrow' : nextDate.format('ddd D MMMM')}</h1>);
                nextDate = nextDate.add(1, 'days');
            }
            if (full)
                panels.push(<TaskWide.Component key={index} task={task} onStateChange={this.onStateChange.bind(this)} onDelete={this.onDelete.bind(this)}/>);
            else
                panels.push(<TaskNarrow.Component key={index} task={task} onStateChange={this.onStateChange.bind(this)} onDelete={this.onDelete.bind(this)}/>);
        });

        return (
            <div className="container">
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
            title:   category.title,
            subject: '',
            context: '',
            category: category.name,
            project: '',
            story: '',
            scheduled: null,
            state: Model.State.PAUSED,
            duration: [],
            collapsed: false
        }).then((task: Model.Task) => {
            var tasks = [task].concat(this.state.tasks);
            this.setState({tasks});
            if (category.autorun)
                this.onStateChange(task, Model.State.RUNNING);
        });
    }

    public onStateChange(task: Model.Task, newState: Model.State) {
        task.state = newState;
        Model.updateState(task)
            .then((changedTasks: Model.Task[]) => {
                var tasks = [];
                this.state.tasks.forEach((oldTask) => {
                    var changedTask = changedTasks.filter((changedTask) => (oldTask._id==changedTask._id))[0];
                    tasks.push(changedTask || oldTask);
                })
                tasks.sort(Model.executionComparator);
                this.setState({tasks});
            });
    }


    public onDelete(task: Model.Task) {
        Model.del(task._id)
            .then((task: Model.Task) => {
                var tasks = this.state.tasks.filter((_task: Model.Task) => {
                    return _task._id != task._id;
                });
                this.setState({tasks});
            });
    }
}
