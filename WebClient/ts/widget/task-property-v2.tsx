import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

class Props {
    task: Model.Task;
}

export class Component extends React.Component<Props, {}> {
    public render() {
        return (
            <div className="tz-sidebar tz-task-properties">
                <header>
                    <span className="tz-title">Properties</span>
                </header>
                <div className="tz-input-group">
                    <input id="title" type="text" value="" required/>
                    <label htmlFor="title">Title</label>
                </div>
                <div className="tz-input-group">
                    <div id="subject" className="tz-input tz-multiline" contentEditable></div>
                    <label htmlFor="subject">Subject</label>
                </div>
                <div className="tz-input-group">
                    <input id="context" type="text" value="" required/>
                    <label htmlFor="context">Context</label>
                </div>
                <div className="tz-input-group">
                    <input id="category" type="text" value="" required/>
                    <label htmlFor="category">Category</label>
                </div>
                <div className="tz-input-group">
                    <input id="project" type="text" value="" required/>
                    <label htmlFor="project">Project</label>
                </div>
                <div className="tz-input-group">
                    <input id="story" type="text" value="" required/>
                    <label htmlFor="story">Story</label>
                </div>
                <div className="tz-input-group">
                    <input id="defer" type="datetime-local" value=""/>
                    <label htmlFor="defer">Defer to</label>
                    <a className="tz-action tz-plus" href="#">+1</a>
                    <a className="tz-action tz-plus" href="#">+7</a>
                    <a className="tz-action tz-plus" href="#">+30</a>
                </div>
            </div>
        );
    }
}
