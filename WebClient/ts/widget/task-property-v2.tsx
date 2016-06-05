import * as React from 'react';

import * as InputText from './input-text-v2';
import * as InputHtml from './input-html-v2';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

export interface Props {
    task: Model.Task;
    onChange: (serverTask: Model.Task) => any;
}

export class Component extends React.Component<Props, {}> {
    public render() {
        var task : Model.Task = this.props.task || Model.EMPTY_TASK;
        var subjectInnerHtml = {__html:task.subject};
        return (
            <div className="tz-sidebar tz-task-properties">
                <header>
                    <span className="tz-title">Properties</span>
                </header>
                <InputText.Component id="title" label="Title" value={task.title} onSuccess={this.onTitleChange.bind(this)}/>
                <InputHtml.Component id="subject" label="Subject" value={task.subject} onSuccess={this.onSubjectChange.bind(this)}/>
                <InputText.Component id="context" label="Context" value={task.context} onSuccess={this.onContextChange.bind(this)}/>
                <InputText.Component id="category" label="Category" value={task.category} onSuccess={this.onCategoryChange.bind(this)}/>
                <InputText.Component id="project" label="Project" value={task.project} onSuccess={this.onProjectChange.bind(this)}/>
                <InputText.Component id="story" label="Story" value={task.story} onSuccess={this.onStoryChange.bind(this)}/>
                <div className="tz-input-group">
                    <input id="defer" type="datetime-local" value={TextUtil.formatInputDateTimeLocal(task.scheduled, false)}/>
                    <label htmlFor="defer">Defer to</label>
                    <a className="tz-action tz-plus" href="#">+1</a>
                    <a className="tz-action tz-plus" href="#">+7</a>
                    <a className="tz-action tz-plus" href="#">+30</a>
                </div>
            </div>
        );
    }

    public onTitleChange(value: string) {
        this.props.task.title = value;
        this.forceUpdate();
        Model.updateTitle(this.props.task)
             .then((task)=>this.props.onChange(task));
    }

    public onSubjectChange(value: string) {
        this.props.task.subject = value;
        this.forceUpdate();
        Model.updateSubject(this.props.task)
             .then((task)=>this.props.onChange(task));
    }

    public onContextChange(value: string) {
        this.props.task.context = value;
        this.forceUpdate();
        Model.updateContext(this.props.task)
             .then((task)=>this.props.onChange(task));
    }

    public onCategoryChange(value: string) {
        this.props.task.category = value;
        this.forceUpdate();
        Model.updateCategory(this.props.task)
             .then((task)=>this.props.onChange(task));

    }

    public onProjectChange(value: string) {
        this.props.task.project = value;
        this.forceUpdate();
        Model.updateProject(this.props.task)
             .then((task)=>this.props.onChange(task));
    }

    public onStoryChange(value: string) {
        this.props.task.story = value;
        this.forceUpdate();
        Model.updateStory(this.props.task)
             .then((task)=>this.props.onChange(task));
    }
}
