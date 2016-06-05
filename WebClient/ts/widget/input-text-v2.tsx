import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface Props {
    id:         string;
    label:      string;
    value:      string;

    onSuccess?: (newValue: string) => any;
    onCancel?:  (oldValue: string) => any;
}

interface State {
    oldValue: string;
    newValue: string;
    inFocus: boolean;
}

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {
            oldValue: "",
            newValue: "",
            inFocus: false
        };
    }

    public render() {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        return (
            <div className="tz-input-group">
                <input  id={this.props.id}
                        type="text"
                        value={value}
                        required
                        onFocus={this.onFocus.bind(this)}
                        onBlur={this.onBlur.bind(this)}
                        onKeyDown={this.onKeyDown.bind(this)}
                        onChange={this.onChange.bind(this)}
                        />
                <label htmlFor={this.props.id}>{this.props.label}</label>
            </div>
        );
    }
    public onFocus(event) {
        if (this.state.inFocus)
            return;

        this.setState({
            inFocus: true,
            oldValue: this.props.value,
            newValue: this.props.value
        });
    }
    public onBlur(event) {
        if (!this.state.inFocus)
            return;

        if (this.props.onSuccess && this.props.value != this.state.newValue)
            this.props.onSuccess(this.state.newValue);

        this.setState({
            inFocus: false,
            newValue: this.state.newValue,
            oldValue: this.state.newValue
        });
    }
    public onKeyDown(event: React.KeyboardEvent) {
        switch(event.keyCode) {
            case 13: //enter
                if (!event.altKey)
                    this.onEnter(event);
                break;
            case 27: //escape
                this.onEscape(event);
                break;
        }
    }
    public onEnter(event: React.KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({
            inFocus: this.state.inFocus,
            newValue: this.state.newValue,
            oldValue: this.state.newValue
        });

        if (this.props.onSuccess && this.props.value != this.state.newValue)
            this.props.onSuccess(this.state.newValue);
    }

    public onEscape(event: React.KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({
            inFocus: this.state.inFocus,
            newValue: this.state.oldValue,
            oldValue: this.state.oldValue
        });

        if (this.props.onCancel)
            this.props.onCancel(this.state.oldValue);
    }

    public onChange(event: React.FormEvent) {
        this.setState({
            inFocus: this.state.inFocus,
            newValue: event.target['value'],
            oldValue: this.state.oldValue
        });
    }

}
