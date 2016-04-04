import * as React from 'react';
import {InboxList, InboxGroup} from './inbox-list';
import * as ModelTask from '../model/task';

class InboxPageState {
    tasks: ModelTask.Task[];
}

export class InboxPage extends React.Component<{},InboxPageState> {
    public constructor() {
        super();
        this.state = {
            tasks: []
        };

        ModelTask.getExecuting().done(((tasks) => {
            this.state.tasks = tasks as ModelTask.Task[];
            this.forceUpdate();
        }).bind(this));
    }

    public render() {
        var messages : InboxGroup[] = [{
            id:     "email-centric",
            name:   "Email: Centric",
            items:  [{
                name: "Hello Centric Email: A"
            },{
                name: "Hello Centric Email: B"
            },{
                name: "Hello Centric Email: C"
            },{
                name: "Hello Centric Email: D"
            },{
                name: "Hello Centric Email: E"
            }],
            active: 0
        },{
            id:     "email-google",
            name:   "Email: Google",
            items:  [{
                name: "Hello Google Email: 1"
            },{
                name: "Hello Google Email: 2"
            },{
                name: "Hello Google Email: 3"
            },{
                name: "Hello Google Email: 4"
            },{
                name: "Hello Google Email: 5"
            },{
                name: "Hello Google Email: 6"
            },{
                name: "Hello Google Email: 7"
            },{
                name: "Hello Google Email: 8"
            }],
            active: 1
        },{
            id:     "email-yahoo",
            name:   "Email: Yahoo",
            items:  [{
                name: "Hello Yahoo Email: I"
            },{
                name: "Hello Yahoo Email: II"
            },{
                name: "Hello Yahoo Email: III"
            },{
                name: "Hello Yahoo Email: IV"
            },{
                name: "Hello Yahoo Email: V"
            },{
                name: "Hello Yahoo Email: IV"
            },{
                name: "Hello Yahoo Email: V"
            }],
            active: 2
        }];
        var group : InboxGroup = {
            id:     "tasks-today",
            name:   "Today",
            items:  [],
            active: 0
        };
        $.each(this.state.tasks, (index: number, task: ModelTask.Task) => {
            group.items.push({name: task.title});
        });

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        <InboxList id="message" groups={messages} active={0} />
                    </div>
                    <div className="col-md-6">
                    Detailes
                    </div>
                    <div className="col-md-3">
                        <InboxList id="tasks" groups={[group]} active={0} />
                    </div>
                </div>
            </div>
        );
    }
}
