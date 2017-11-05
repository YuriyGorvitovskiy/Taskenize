import * as Moment from "moment";
import * as React from "react";

import * as Model from "../model/task";

export interface IProps extends React.Props<Component> {
    task: Model.ITask;
    requestUncompletedTasks: (callback: (uncompletedTasks: Model.ITask[]) => any) => any;
}

export interface IState  {
    tasksToFollow: Model.ITask[];
}

export class Component extends React.Component<IProps, IState> {
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
    public componentDidMount?(): void {
        if (this.state.tasksToFollow == null) {
            this.props.requestUncompletedTasks((
                (tasks) => this.setState({
                    tasksToFollow: tasks,
                })
            ));
        }
    }

    public render() {
        const sentence = [];
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

    private renderSentence(automation: Model.IAutomation, sentence: JSX.Element[]) {
        sentence.push((
            <select value={automation.behavior} onChange={this.behaviorChange} key={sentence.length}>
                <option value={Model.Behavior.NONE}>None</option>
                <option value={Model.Behavior.REPEAT}>Repeat</option>
                <option value={Model.Behavior.FOLLOWED}>Followed</option>
            </select>
        ));
        if (automation.behavior === Model.Behavior.REPEAT) {
            sentence.push((<span key={sentence.length}>&nbsp;task&nbsp;</span>));
            this.renderTimingSentence(automation, sentence);
        } else if (automation.behavior === Model.Behavior.FOLLOWED) {
            const options = [];
            if (this.state.tasksToFollow != null) {
                for (const taskToFollow of this.state.tasksToFollow) {
                    if (taskToFollow._id !== this.props.task._id) {
                        options.push((
                            <option value={taskToFollow._id} key={options.length}>
                                {taskToFollow.title}
                            </option>
                        ));
                    }
                }
            }
            sentence.push((
                <span key={sentence.length}>&nbsp;by&nbsp;
                    <select value={automation.relatedTaskId} onChange={this.relatedTaskIdChange} key={sentence.length}>
                        {options}
                    </select>&nbsp;task&nbsp;
                </span>
            ));
            this.renderTimingSentence(automation, sentence);
        }
        sentence.push((<span key={sentence.length}>.</span>));
    }
    private renderTimingSentence(automation: Model.IAutomation, sentence: JSX.Element[]) {
        sentence.push((
            <select
                value={automation.timingKind}
                onChange={this.timingKindChange}
                key={sentence.length}
            >
                <option value={Model.TimingKind.IN}>in</option>
                <option value={Model.TimingKind.AFTER}>after</option>
            </select>
        ));
        sentence.push((<span key={sentence.length}>&nbsp;</span>));
        sentence.push((
            <input
                type="number"
                name="after"
                value={automation.timingDuration}
                min="0"
                onChange={this.timingDurationChange}
                key={sentence.length}
            />
        ));
        sentence.push((<span key={sentence.length}>&nbsp;</span>));
        sentence.push((
            <select
                value={automation.timingDurationUnit}
                onChange={this.timingDurationUnitChange}
                key={sentence.length}
            >
                <option value={Model.TimingDurationUnit.MINUTE}>minute(s)</option>
                <option value={Model.TimingDurationUnit.HOUR}>hour(s)</option>
                <option value={Model.TimingDurationUnit.DAY}>day(s)</option>
                <option value={Model.TimingDurationUnit.WEEK}>week(s)</option>
                <option value={Model.TimingDurationUnit.MONTH}>month(s)</option>
            </select>
        ));
        if (automation.timingKind === Model.TimingKind.AFTER) {
            this.renderAfterSentence(automation, sentence);
        }
    }

    private renderAfterSentence(automation: Model.IAutomation, sentence: JSX.Element[]) {
        if (automation.timingAdjustmentKind === Model.TimingAdjustmentKind.DAY_OF_THE_MONTH) {
            sentence.push((<span key={sentence.length}>&nbsp;on the&nbsp;</span>));
            sentence.push((
                <input
                    type="number"
                    name="onday"
                    value={automation.timingAdjustment}
                    min="1"
                    max="31"
                    onChange={this.timingAdjustmentChange}
                    key={sentence.length}
                />
            ));
            sentence.push((<span key={sentence.length}>&nbsp;</span>));
        } else {
            sentence.push((<span key={sentence.length}>&nbsp;on&nbsp;</span>));
        }
        sentence.push((
            <select
                value={automation.timingAdjustmentKind}
                onChange={this.timingAdjustmentKindChange}
                key={sentence.length}
            >
                <option value={Model.TimingAdjustmentKind.MONDAY}>Monday</option>
                <option value={Model.TimingAdjustmentKind.TUESDAY}>Tuesday</option>
                <option value={Model.TimingAdjustmentKind.WEDNESDAY}>Wednesday</option>
                <option value={Model.TimingAdjustmentKind.THURSDAY}>Thursday</option>
                <option value={Model.TimingAdjustmentKind.FRIDAY}>Friday</option>
                <option value={Model.TimingAdjustmentKind.SATURDAY}>Saturday</option>
                <option value={Model.TimingAdjustmentKind.SUNDAY}>Sunday</option>
                <option value={Model.TimingAdjustmentKind.DAY_OF_THE_MONTH}>day of the month</option>
            </select>
        ));
    }

    private behaviorChange = (event) => {
        const automation = this.props.task.automation;
        const newBehavior = parseInt(event.target.value, 10);
        if (automation.behavior === newBehavior) {
            return;
        }

        if (newBehavior === Model.Behavior.REPEAT) {
            if (automation.timingKind == null) {
                automation.timingKind = Model.TimingKind.AFTER;
            }
            if (!automation.timingDuration) {
                automation.timingDuration = 5;
            }
            if (automation.timingDurationUnit == null) {
                automation.timingDurationUnit = Model.TimingDurationUnit.DAY;
            }
            if (automation.timingAdjustmentKind == null) {
                automation.timingAdjustmentKind = Moment().isoWeekday() - 1 + Model.TimingAdjustmentKind.MONDAY;
            }
        }
        if (newBehavior === Model.Behavior.FOLLOWED) {
            if (automation.timingKind == null) {
                automation.timingKind = Model.TimingKind.IN;
            }
            if (!automation.timingDuration) {
                automation.timingDuration = 1;
            }
            if (automation.timingDurationUnit == null) {
                automation.timingDurationUnit = Model.TimingDurationUnit.DAY;
            }
            if (automation.relatedTaskId == null) {
                automation.relatedTaskId = this.getBestRelatedTask()._id;
            }
        }
        this.props.task.automation.behavior = newBehavior;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private relatedTaskIdChange = (event) => {
        const automation = this.props.task.automation;
        const value = event.target.value;
        if (automation.relatedTaskId === value) {
            return;
        }

        automation.relatedTaskId = value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private timingKindChange = (event) => {
        const automation = this.props.task.automation;
        const value = parseInt(event.target.value, 10);
        if (automation.timingKind === value) {
            return;
        }

        if (automation.timingKind === Model.TimingKind.IN) {
            if (automation.timingAdjustmentKind == null) {
                automation.timingAdjustmentKind = Moment().isoWeekday() - 1 + Model.TimingAdjustmentKind.MONDAY;
            }
        }
        automation.timingKind = value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private timingDurationChange = (event) => {
        const automation = this.props.task.automation;
        const value = parseInt(event.target.value, 10);
        if (automation.timingDuration === value) {
            return;
        }

        automation.timingDuration = value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }
    private timingDurationUnitChange = (event) => {
        const automation = this.props.task.automation;
        const value = parseInt(event.target.value, 10);
        if (automation.timingDurationUnit === value) {
            return;
        }

        automation.timingDurationUnit = value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private timingAdjustmentChange = (event) => {
        const automation = this.props.task.automation;
        const value = parseInt(event.target.value, 10);
        if (automation.timingAdjustment === value) {
            return;
        }

        automation.timingAdjustment = value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private timingAdjustmentKindChange = (event) => {
        const automation = this.props.task.automation;
        const value = parseInt(event.target.value, 10);
        if (automation.timingAdjustmentKind === value) {
            return;
        }

        if (value === Model.TimingAdjustmentKind.DAY_OF_THE_MONTH) {
            if (automation.timingAdjustment == null) {
                automation.timingAdjustment = 1;
            }
        }

        automation.timingAdjustmentKind = value;
        this.forceUpdate();
        Model.updateAutomation(this.props.task);
    }

    private getBestRelatedTask(): Model.ITask {
        let bestTask: Model.ITask = null;
        let howGood = 0;
        for (const task of this.state.tasksToFollow) {
            if (task === this.props.task) {
                continue;
            }
            if (bestTask == null) {
                bestTask = task;
                howGood = 1;
            }
            if (this.props.task.category === task.category) {
                if (howGood < 2) {
                    bestTask = task;
                    howGood = 2;
                }
                if (this.props.task.project === task.project) {
                    if (howGood < 3) {
                        bestTask = task;
                        howGood = 3;
                    }
                    if (this.props.task.story === task.story) {
                        if (howGood < 4) {
                            bestTask = task;
                            howGood = 4;
                        }
                        if (this.props.task.context === task.context) {
                            if (howGood < 5) {
                                bestTask = task;
                                howGood = 5;
                            }
                        }
                    }
                }
            }
        }
        return bestTask;
    }
}
