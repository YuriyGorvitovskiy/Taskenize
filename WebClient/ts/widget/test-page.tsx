import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Moment from 'moment';

import * as TaskNarrow from './task-narrow';
import * as TaskWide from './task-wide';
import * as TaskPanel from './test-task';

import * as Model from '../model/task';
import * as StyleUtil from '../util/style';

var PAGE_START_MOMENT = Moment();
export class TestPage extends React.Component<{},{}> {
    public constructor() {
        super();
    }

    public render() {
        var env = StyleUtil.findBootstrapEnvironment();
        var full = (env == 'md' || env == 'lg');

        var actions = [];
        $.each(Model.Category.ALL, (index: number, category: Model.Category) => {
            actions.push(
                <button key={index} type="button" className={"col-xs-2 btn btn-" + category.css}>
                    <span className={"glyphicon glyphicon-" + category.glyph}></span>{full ? " " + category.name : ""}
                </button>
            );
        });
        var panels = [];
        for(var index = 0; index < 5; ++index) {
            var task: Model.Task = {
                _id:        "id_" + index,
                state:      index == 0 ? Model.State.RUNNING : index == 1 ? Model.State.COMPLETED : Model.State.PAUSED,
                title:      "Task title number " + index + ".",
                subject:    "Task subject of some description number " + index + ".",
                context:    "Context" + index,
                category:   Model.Category.ALL[index%6].name,
                project:    index ? "Project" + index : "",
                story:      "Story" + index,
                scheduled:  Moment(PAGE_START_MOMENT).add(index, 'd').toDate(),
                duration:   [
                                {begin: PAGE_START_MOMENT.toDate(), end: null},
                                {begin: Moment(PAGE_START_MOMENT).add(-2*index, 'h').toDate(), end: Moment(PAGE_START_MOMENT).add(-index, 'h').toDate()}
                            ],
                collapsed:  true
            }
            if (full)
                panels.push(<TaskWide.Component key={index} task={task}/>);
            else
                panels.push(<TaskNarrow.Component key={index} task={task}/>);
        };
        for(var index = 5; index < 10; ++index) {
            panels.push(<TaskPanel.Component key={index} active={index == 0} complete={index%5==0} category={Model.Category.ALL[index%6]}/>);
        };
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

}
