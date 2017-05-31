import * as React from 'react';

export interface Props extends React.Props<Component> {
};

type Behavior = 'none' | 'repeat' | 'followed';
type TimingKind = 'in' | 'after';
type TimingDurationUnit = 'day' | 'week' | 'month';
type TimingAdjustmentKind = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'day-of-the-month';

interface State  {
    behavior : Behavior;
    timingKind ?:TimingKind;
    timingDuration ?: number;
    timingDurationUnit ?: TimingDurationUnit;
    timingAdjustment ?: number;
    timingAdjustmentKind ?: TimingAdjustmentKind;
};

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {behavior: 'none'};

        this.behaviorChange = this.behaviorChange.bind(this);
        this.timingKindChange = this.timingKindChange.bind(this);
        this.timingDurationChange = this.timingDurationChange.bind(this);
        this.timingDurationUnitChange = this.timingDurationUnitChange.bind(this);
        this.timingAdjustmentChange = this.timingAdjustmentChange.bind(this);
        this.timingAdjustmentKindChange = this.timingAdjustmentKindChange.bind(this);
    }

    public render() {
        let sentence = [];
        this.renderSentence(sentence);
        return (
            <div className="form-group repeat">
                <label className="control-label">Behavior</label>
                <div>
                    {sentence}
                </div>
            </div>
        );
    }

    private renderSentence(sentence: JSX.Element[]) {
        sentence.push(
            <select value={this.state.behavior} onChange={this.behaviorChange} key={sentence.length}>
                <option value="none">None</option>
                <option value="repeat">Repeat</option>
                <option value="followed">Followed</option>
            </select>
        );
        if (this.state.behavior == 'repeat') {
            sentence.push(<span key={sentence.length}>&nbsp;task&nbsp;</span>);
            this.renderTimingSentence(sentence);
        } else if (this.state.behavior == 'followed') {
            sentence.push(<span key={sentence.length}>&nbsp;by 'Education' task&nbsp;</span>);
            this.renderTimingSentence(sentence);
        }
        sentence.push(<span key={sentence.length}>.</span>);
    }
    private renderTimingSentence(sentence: JSX.Element[]) {
        sentence.push(
            <select value={this.state.timingKind} onChange={this.timingKindChange} key={sentence.length}>
                <option value="in">in</option>
                <option value="after">after</option>
            </select>
        );
        sentence.push(<span key={sentence.length}>&nbsp;</span>);
        sentence.push(<input type="number" name="after" value={this.state.timingDuration} min="0" onChange={this.timingDurationChange} key={sentence.length}/>);
        sentence.push(<span key={sentence.length}>&nbsp;</span>);
        sentence.push(
            <select value={this.state.timingDurationUnit} onChange={this.timingDurationUnitChange} key={sentence.length}>
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
                <option value="month">month(s)</option>
            </select>
        );
        if (this.state.timingKind == 'after') {
            this.renderAfterSentence(sentence);
        }
    }

    private renderAfterSentence(sentence: JSX.Element[]) {
        if (this.state.timingAdjustmentKind == 'day-of-the-month') {
            sentence.push(<span key={sentence.length}>&nbsp;on the&nbsp;</span>);
            sentence.push(<input type="number" name="onday" value={this.state.timingAdjustment} min="1" max="31" onChange={this.timingAdjustmentChange} key={sentence.length}/>);
            sentence.push(<span key={sentence.length}>&nbsp;</span>);
        } else {
            sentence.push(<span key={sentence.length}>&nbsp;on&nbsp;</span>);
        }
        sentence.push(
            <select value={this.state.timingAdjustmentKind} onChange={this.timingAdjustmentKindChange} key={sentence.length}>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
                <option value="day-of-the-month">day of the month</option>
            </select>
        );
    }

    private behaviorChange(event) {
        this.copyTheRestAndSetState({
            behavior: event.target.value
        });
    }

    private timingKindChange(event) {
        this.copyTheRestAndSetState({
            behavior: this.state.behavior,
            timingKind: event.target.value
        });
    }
    private timingDurationChange(event) {
        this.copyTheRestAndSetState({
            behavior: this.state.behavior,
            timingDuration: parseInt(event.target.value)
        });
    }
    private timingDurationUnitChange(event) {
        this.copyTheRestAndSetState({
            behavior: this.state.behavior,
            timingDurationUnit: event.target.value
        });
    }
    private timingAdjustmentChange(event) {
        this.copyTheRestAndSetState({
            behavior: this.state.behavior,
            timingAdjustment: parseInt(event.target.value)
        });
    }
    private timingAdjustmentKindChange(event) {
        this.copyTheRestAndSetState({
            behavior: this.state.behavior,
            timingAdjustmentKind: event.target.value
        });
    }

    private copyTheRestAndSetState(newState: State) {
        if (newState.timingKind == null) {
            if (this.state.timingKind != null) {
                newState.timingKind = this.state.timingKind;
            } else if (newState.behavior != 'none') {
                newState.timingKind = 'in';
            }
        }

        if (newState.timingDuration == null) {
            if (this.state.timingDuration != null) {
                newState.timingDuration = this.state.timingDuration;
            } else if (newState.behavior != 'none') {
                newState.timingDuration = 1;
            }
        }

        if (newState.timingDurationUnit == null) {
            if (this.state.timingDurationUnit != null) {
                newState.timingDurationUnit = this.state.timingDurationUnit;
            } else if (newState.behavior != 'none') {
                newState.timingDurationUnit = 'week';
            }
        }

        if (newState.timingAdjustmentKind == null) {
            if (this.state.timingAdjustmentKind != null) {
                newState.timingAdjustmentKind = this.state.timingAdjustmentKind;
            } else if (newState.timingKind == 'after') {
                newState.timingAdjustmentKind = 'monday';
            }
        }

        if (newState.timingAdjustment == null) {
            if (this.state.timingAdjustment != null) {
                newState.timingAdjustment = this.state.timingAdjustment;
            } else if (newState.timingAdjustmentKind == 'day-of-the-month') {
                newState.timingAdjustment = 1;
            }
        }

        this.setState(newState);
    }
}
