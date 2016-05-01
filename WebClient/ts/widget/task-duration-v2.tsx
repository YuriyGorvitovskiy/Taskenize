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
            <div className="sidebar task-duration">
                <header>
                    <span className="title">Duration</span>
                    <span className="duration">00:12:34</span>
                </header>
                <section className="period">
                    <input className="to" type="text" value="In progress..." readOnly/>
                    <input className="from" type="datetime-local" step="1" value="2015-04-24T12:34:56" required/>
                    <span className="duration">00:12:34</span>
                    <br/>
                    <a className="action delete" href="#"></a>
                </section>
                <section className="period">
                    <input className="to" type="datetime-local" step="1" value="2015-04-24T12:34:56" required/>
                    <input className="from" type="datetime-local" step="1" value="2015-04-24T11:22:33" required/>
                    <span className="duration">01:12:23</span>
                    <br/>
                    <a className="action delete" href="#"></a>
                </section>
            </div>
        );
    }
}
