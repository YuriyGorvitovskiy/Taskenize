import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

class Props {
    task: Model.Task;
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
                <div className="tz-input-group">
                    <input id="title" type="text" value={task.title} required/>
                    <label htmlFor="title">Title</label>
                </div>
                <div className="tz-input-group">
                    <div id="subject" className="tz-input tz-multiline" dangerouslySetInnerHTML={subjectInnerHtml} contentEditable></div>
                    <label htmlFor="subject">Subject</label>
                </div>
                <div className="tz-input-group">
                    <input id="context" type="text" value={task.context} required/>
                    <label htmlFor="context">Context</label>
                </div>
                <div className="tz-input-group">
                    <input id="category" type="text" value={task.category} required/>
                    <label htmlFor="category">Category</label>
                </div>
                <div className="tz-input-group">
                    <input id="project" type="text" value={task.project} required/>
                    <label htmlFor="project">Project</label>
                </div>
                <div className="tz-input-group">
                    <input id="story" type="text" value={task.story} required/>
                    <label htmlFor="story">Story</label>
                </div>
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
}
