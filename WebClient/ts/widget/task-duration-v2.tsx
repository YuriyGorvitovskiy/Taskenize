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
            <div className="tz-sidebar tz-task-duration">
                <header>
                    <span className="tz-title">Duration</span>
                    <span className="tz-duration">00:12:34</span>
                </header>
                <section className="tz-period">
                    <input className="tz-to" type="text" value="In progress..." readOnly/>
                    <input className="tz-from" type="datetime-local" step="1" value="2015-04-24T12:34:56" required/>
                    <span className="tz-duration">00:12:34</span>
                    <br/>
                    <a className="tz-action tz-delete" href="#"></a>
                </section>
                <section className="tz-period">
                    <input className="tz-to" type="datetime-local" step="1" value="2015-04-24T12:34:56" required/>
                    <input className="tz-from" type="datetime-local" step="1" value="2015-04-24T11:22:33" required/>
                    <span className="tz-duration">01:12:23</span>
                    <br/>
                    <a className="tz-action tz-delete" href="#"></a>
                </section>
            </div>
        );
    }
}
