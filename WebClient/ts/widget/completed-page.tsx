import * as React from 'react';
import * as Moment from 'moment';

import * as TaskWide from './task-wide';
import * as TaskNarrow from './task-narrow';
import * as Model from '../model/task';
import * as Report from '../model/report';

import * as StyleUtil from '../util/style';


const anchorLabel : {[key:number]: string} = {};
anchorLabel[Report.Ancor.NOW] = 'Up to now';
anchorLabel[Report.Ancor.CURRENT] = 'Current';
anchorLabel[Report.Ancor.LAST] = 'Last';

const rangeLabel : {[key:number]: string} = {};
rangeLabel[Report.Range.DAY] = 'Day';
rangeLabel[Report.Range.WEEK] = 'Week';
rangeLabel[Report.Range.MONTH] = 'Month';

const propertyLabel : {[key:number]: string} = {};
propertyLabel[Report.Property.COMPLETED_TIME] = 'Completed Time';
propertyLabel[Report.Property.CONTEXT] = 'Context';
propertyLabel[Report.Property.CATEGORY] = 'Category';
propertyLabel[Report.Property.PROJECT] = 'Project';
propertyLabel[Report.Property.STORY] = 'Story';
propertyLabel[Report.Property.TASK] = 'Task';

interface State {
    ancor: Report.Ancor;
    range: Report.Range;
    order_by: Report.Property;
    tasks: Model.Task[];
}

export class Component extends React.Component<{},State> {
    public constructor() {
        super();
        this.requestTasks(Report.Ancor.NOW, Report.Range.WEEK, Report.Property.COMPLETED_TIME);
    }

    public render() {
        var env = StyleUtil.findBootstrapEnvironment();
        var full = (env == 'md' || env == 'lg');
        var ancor = anchorLabel[this.state.ancor];
        var range = rangeLabel[this.state.range];
        var order_by = propertyLabel[this.state.order_by];

        var panels = [];
        var groupNamer = Model.getGroupNamer(this.state.order_by);
        var prevGroupName = '';
        $.each(this.state.tasks, (index: number, task: Model.Task) => {
            var nextGroupName = groupNamer(task);
            if (prevGroupName != nextGroupName) {
                panels.push(<h1 key={"g"+index}>{nextGroupName}</h1>);
                prevGroupName = nextGroupName;
            }
            if (full)
                panels.push(<TaskWide.Component key={index} task={task} onStateChange={this.onStateChange.bind(this)} onDelete={this.onDelete.bind(this)}/>);
            else
                panels.push(<TaskNarrow.Component key={index} task={task} onStateChange={this.onStateChange.bind(this)} onDelete={this.onDelete.bind(this)}/>);
        });

        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button type="button"
                                    className="col-xs-12 btn btn-info dropdown-toggle"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false">
                                {ancor} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#" onClick={this.onAncorClick.bind(this, Report.Ancor.NOW)}>
                                    {anchorLabel[Report.Ancor.NOW]}
                                </a></li>
                                <li><a href="#" onClick={this.onAncorClick.bind(this, Report.Ancor.CURRENT)}>
                                    {anchorLabel[Report.Ancor.CURRENT]}
                                </a></li>
                                <li><a href="#" onClick={this.onAncorClick.bind(this, Report.Ancor.LAST)}>
                                    {anchorLabel[Report.Ancor.LAST]}
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button type="button"
                                    className="col-xs-12 btn btn-primary dropdown-toggle"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false">
                                {range} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#" onClick={this.onRangeClick.bind(this, Report.Range.DAY)}>
                                    {rangeLabel[Report.Range.DAY]}
                                </a></li>
                                <li><a href="#" onClick={this.onRangeClick.bind(this, Report.Range.WEEK)}>
                                    {rangeLabel[Report.Range.WEEK]}
                                </a></li>
                                <li><a href="#" onClick={this.onRangeClick.bind(this, Report.Range.MONTH)}>
                                    {rangeLabel[Report.Range.MONTH]}
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button type="button"
                                    className="col-xs-12 btn btn-success dropdown-toggle"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false">
                                {order_by} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Report.Property.COMPLETED_TIME)}>
                                    {propertyLabel[Report.Property.COMPLETED_TIME]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Report.Property.CONTEXT)}>
                                    {propertyLabel[Report.Property.CONTEXT]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Report.Property.CATEGORY)}>
                                    {propertyLabel[Report.Property.CATEGORY]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Report.Property.PROJECT)}>
                                    {propertyLabel[Report.Property.PROJECT]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Report.Property.STORY)}>
                                    {propertyLabel[Report.Property.STORY]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Report.Property.TASK)}>
                                    {propertyLabel[Report.Property.TASK]}
                                </a></li>
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

    public onStateChange(task: Model.Task, newState: Model.State) {
        task.state = newState;
        Model.updateState(task, newState)
            .then((changedTasks: Model.Task[]) => {
                var tasks = [];
                this.state.tasks.forEach((oldTask) => {
                    var changedTask = changedTasks.filter((changedTask) => (oldTask._id==changedTask._id))[0];
                    tasks.push(changedTask || oldTask);
                })
                this.setState({
                    ancor: this.state.ancor,
                    range: this.state.range,
                    order_by: this.state.order_by,
                    tasks: tasks
                });
            });
    }


    public onDelete(task: Model.Task) {
        Model.del(task._id)
            .then((task: Model.Task) => {
                var tasks = this.state.tasks.filter((_task: Model.Task) => {
                    return _task._id != task._id;
                });
                this.setState({
                    ancor: this.state.ancor,
                    range: this.state.range,
                    order_by: this.state.order_by,
                    tasks: tasks
                });
            });
    }

    public onAncorClick(ancor: Report.Ancor, ev: React.MouseEvent) {
        ev.preventDefault();
        this.requestTasks(ancor, this.state.range, this.state.order_by);
    }

    public onRangeClick(range: Report.Range, ev: React.MouseEvent) {
        ev.preventDefault();
        this.requestTasks(this.state.ancor, range, this.state.order_by);
    }

    public onPropertyClick(order_by: Report.Property, ev: React.MouseEvent) {
        ev.preventDefault();
        this.state.tasks.sort(Model.getComparator(order_by));
        this.setState({
            ancor: this.state.ancor,
            range: this.state.range,
            order_by: order_by,
            tasks: this.state.tasks
        });

        this.requestTasks(this.state.ancor, this.state.range, order_by);
    }

    public requestTasks(ancor: Report.Ancor, range: Report.Range, order_by: Report.Property) {
        var newState : State = {
            ancor: ancor,
            range: range,
            order_by: order_by,
            tasks: []
        };
        if (this.state == null)
            this.state = newState;
        else
            this.setState(newState);

        Model.getCompleted(Report.calculatePeriod(ancor, range)).done(((serverTasks) => {
            var tasks = serverTasks as Model.Task[];
            tasks.sort(Model.getComparator(order_by));
            this.setState({
                ancor: ancor,
                range: range,
                order_by: order_by,
                tasks: tasks
            });
        }).bind(this));
    }

}
