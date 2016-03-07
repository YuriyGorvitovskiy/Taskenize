import * as React from 'react';
import * as TaskPanel from './task-panel';
import * as Model from '../model/task';

class ExecutionPageState {
    tasks: Model.Task[];
}

export class ExecutionPage extends React.Component<{},ExecutionPageState> {
    public constructor() {
        super();
        this.state = {
            tasks: []
        };

        Model.getAll().done(((tasks) => {
            this.state.tasks = tasks as Model.Task[];
            this.forceUpdate();
        }).bind(this));
    }

    public render() {
        var actions = [];
        $.each(Model.Category.ALL, (index: number, category: Model.Category) => {
            actions.push(<button key={index} type="button" className={"col-sm-2 btn btn-" + category.css} onClick={()=>this.onNewTask(category)}>{category.name}</button>);
        });

        var panels = [];
        $.each(this.state.tasks, (index: number, task: Model.Task) => {
            if (index == 2)
                panels.push(<h1 key={"d"+index}>Tomorrow</h1>);
            panels.push(<TaskPanel.Component key={index} task={task} onActivate={this.onActivate.bind(this)} onDelete={this.onDelete.bind(this)}/>);
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
            title:   category.prefix,
            subject: '',
            context: '',
            category: '',
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
                this.onActivate(task, true);
        });
    }

    public onActivate(task: Model.Task, toActivate: boolean) {
        task.state = toActivate ? Model.State.RUNNING : Model.State.PAUSED;
        if (toActivate) {
            var tasks = [task].concat(this.state.tasks.filter((t) => (t !== task)));
            this.setState({tasks});        
        }
        Model.updateState(task)
            .then((changedTasks: Model.Task[]) => {
                var tasks = [];
                this.state.tasks.forEach((oldTask) => {
                    var changedTask = changedTasks.filter((changedTask) => (oldTask._id==changedTask._id))[0];
                    tasks.push(changedTask || oldTask);
                })
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
