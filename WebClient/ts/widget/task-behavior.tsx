import * as React from 'react';
import * as Model from '../model/task';

export interface Props extends React.Props<Component> {
    task:                    Model.Task,
    requestUncompletedTasks: (callback: (uncompletedTasks: Model.Task[])=>any) => any;
};

interface State  {
    tasksToFollow: Model.Task[]
}

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {tasksToFollow: null};

        this.behaviorChange = this.behaviorChange.bind(this);
        this.relatedTaskIdChange = this.relatedTaskIdChange.bind(this);
        this.timingKindChange = this.timingKindChange.bind(this);
        this.timingDurationChange = this.timingDurationChange.bind(this);
        this.timingDurationUnitChange = this.timingDurationUnitChange.bind(this);
        this.timingAdjustmentChange = this.timingAdjustmentChange.bind(this);
        this.timingAdjustmentKindChange = this.timingAdjustmentKindChange.bind(this);
    }
    componentDidMount?(): void {
        if (this.state.tasksToFollow == null) {
            this.props.requestUncompletedTasks((tasks)=>
                this.setState({tasksToFollow: tasks})
            );
        }
    }

    public render() {
        let sentence = [];
        this.renderSentence(this.props.task.automation, sentence);
        return (
            <div className="behavior">
                <label className="label-behavior">Behavior</label>
                <div>
                    {sentence}
                </div>
            </div>
        );
    }

    private renderSentence(automation: Model.Automation, sentence: JSX.Element[]) {
        sentence.push(
            <select value={automation.behavior} onChange={this.behaviorChange} key={sentence.length}>
                <option value={Model.Behavior.NONE}>None</option>
                <option value={Model.Behavior.REPEAT}>Repeat</option>
                <option value={Model.Behavior.FOLLOWED}>Followed</option>
            </select>
        );
        if (automation.behavior == Model.Behavior.REPEAT) {
            sentence.push(<span key={sentence.length}>&nbsp;task&nbsp;</span>);
            this.renderTimingSentence(automation, sentence);
        } else if (automation.behavior == Model.Behavior.FOLLOWED) {
            let options = [];
            if (this.state.tasksToFollow != null) {
                for(const taskToFollow of this.state.tasksToFollow) {
                    if (taskToFollow._id != this.props.task._id) {
                        options.push(<option value={taskToFollow._id} key={options.length}>{taskToFollow.title}</option>);
                    }
                }
            }
            sentence.push(
                <span key={sentence.length}>&nbsp;by&nbsp;
                    <select value={automation.relatedTaskId} onChange={this.relatedTaskIdChange} key={sentence.length}>
                        {options}
                    </select>&nbsp;task&nbsp;
                </span>
            );
            this.renderTimingSentence(automation, sentence);
        }
        sentence.push(<span key={sentence.length}>.</span>);
    }
    private renderTimingSentence(automation: Model.Automation, sentence: JSX.Element[]) {
        sentence.push(
            <select value={automation.timingKind} onChange={this.timingKindChange} key={sentence.length}>
                <option value={Model.TimingKind.IN}>in</option>
                <option value={Model.TimingKind.AFTER}>after</option>
            </select>
        );
        sentence.push(<span key={sentence.length}>&nbsp;</span>);
        sentence.push(<input type="number" name="after" value={automation.timingDuration} min="0" onChange={this.timingDurationChange} key={sentence.length}/>);
        sentence.push(<span key={sentence.length}>&nbsp;</span>);
        sentence.push(
            <select value={automation.timingDurationUnit} onChange={this.timingDurationUnitChange} key={sentence.length}>
                <option value={Model.TimingDurationUnit.DAY}>day(s)</option>
                <option value={Model.TimingDurationUnit.WEEK}>week(s)</option>
                <option value={Model.TimingDurationUnit.MONTH}>month(s)</option>
            </select>
        );
        if (automation.timingKind == Model.TimingKind.AFTER) {
            this.renderAfterSentence(automation, sentence);
        }
    }

    private renderAfterSentence(automation: Model.Automation, sentence: JSX.Element[]) {
        if (automation.timingAdjustmentKind == Model.TimingAdjustmentKind.DAY_OF_THE_MONTH) {
            sentence.push(<span key={sentence.length}>&nbsp;on the&nbsp;</span>);
            sentence.push(<input type="number" name="onday" value={automation.timingAdjustment} min="1" max="31" onChange={this.timingAdjustmentChange} key={sentence.length}/>);
            sentence.push(<span key={sentence.length}>&nbsp;</span>);
        } else {
            sentence.push(<span key={sentence.length}>&nbsp;on&nbsp;</span>);
        }
        sentence.push(
            <select value={automation.timingAdjustmentKind} onChange={this.timingAdjustmentKindChange} key={sentence.length}>
                <option value={Model.TimingAdjustmentKind.MONDAY}>Monday</option>
                <option value={Model.TimingAdjustmentKind.TUESDAY}>Tuesday</option>
                <option value={Model.TimingAdjustmentKind.WEDNESDAY}>Wednesday</option>
                <option value={Model.TimingAdjustmentKind.THURSDAY}>Thursday</option>
                <option value={Model.TimingAdjustmentKind.FRIDAY}>Friday</option>
                <option value={Model.TimingAdjustmentKind.SATURDAY}>Saturday</option>
                <option value={Model.TimingAdjustmentKind.SUNDAY}>Sunday</option>
                <option value={Model.TimingAdjustmentKind.DAY_OF_THE_MONTH}>day of the month</option>
            </select>
        );
    }

    private behaviorChange(event) {
        const automation = this.props.task.automation;
        if (automation.behavior == event.target.value)
            return;

        if (automation.behavior == Model.Behavior.NONE) {
            if (automation.timingKind == null) {
                automation.timingKind = Model.TimingKind.IN;
            }
            if (automation.timingDuration == null) {
                automation.timingDuration = 1;
            }
            if (automation.timingDurationUnit == null) {
                automation.timingDurationUnit = Model.TimingDurationUnit.WEEK;
            }
        }
        this.props.task.automation.behavior = event.target.value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private relatedTaskIdChange(event) {
        const automation = this.props.task.automation;
        if (automation.relatedTaskId == event.target.value)
            return;

        automation.relatedTaskId = event.target.value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private timingKindChange(event) {
        const automation = this.props.task.automation;
        if (automation.timingKind == event.target.value)
            return;

        if (automation.timingKind == Model.TimingKind.IN) {
            if (automation.timingAdjustmentKind == null) {
                automation.timingAdjustmentKind = Model.TimingAdjustmentKind.MONDAY;
            }
        }
        automation.timingKind = event.target.value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }
    private timingDurationChange(event) {
        const automation = this.props.task.automation;
        if (automation.timingDuration == parseInt(event.target.value))
            return;

        automation.timingDuration = parseInt(event.target.value);
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }
    private timingDurationUnitChange(event) {
        const automation = this.props.task.automation;
        if (automation.timingDurationUnit == event.target.value)
            return;

        automation.timingDurationUnit = event.target.value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }
    private timingAdjustmentChange(event) {
        const automation = this.props.task.automation;
        if (automation.timingAdjustment == parseInt(event.target.value))
            return;

        automation.timingAdjustment = parseInt(event.target.value);
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }
    private timingAdjustmentKindChange(event) {
        const automation = this.props.task.automation;
        if (automation.timingAdjustmentKind == event.target.value)
            return;

        if (event.target.value == Model.TimingAdjustmentKind.DAY_OF_THE_MONTH) {
            if (automation.timingAdjustment == null) {
                automation.timingAdjustment = 1;
            }
        }

        automation.timingAdjustmentKind = event.target.value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }
}
