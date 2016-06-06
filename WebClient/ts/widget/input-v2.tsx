import * as React from 'react';
import * as ReactDOM from 'react-dom';
const sanitizeHTML = require('sanitize-html');

export interface Props<T> {
    id:         string;
    label:      string;
    value:      T;

    onSuccess:  (newValue: T) => any;
}

export interface State<T> {
    inFocus: boolean;
    newValue: T;
    oldValue: T;
}

export abstract class Component<T> extends React.Component<Props<T>, State<T>> {
    public constructor() {
        super();
        this.state = {
            inFocus: false,
            newValue: null,
            oldValue: null
        };
    }

    public abstract renderInput() : JSX.Element;
    public abstract extractValue(domElement: EventTarget) : T;

    public renderSubAction() : JSX.Element[] {
        return [];
    }

    public render() {
        return (
            <div className="tz-input-group">
                {this.renderInput()}
                <label htmlFor={this.props.id}>{this.props.label}</label>
                {this.renderSubAction()}
            </div>
        );
    }

    public onKeyDown(event: React.KeyboardEvent) {
        switch(event.keyCode) {
            case 13: //enter
                this.onEnter(event);
                break;
            case 27: //escape
                this.onEscape(event);
                break;
        }
    }

    public onChange(event: React.FormEvent) {
        this.setState({
            inFocus: this.state.inFocus,
            newValue: this.extractValue(event.target),
            oldValue: this.state.oldValue
        });
    }

    public onFocus(event) {
        if (this.state.inFocus)
            return;

        this.setState({
            inFocus: true,
            newValue: this.props.value,
            oldValue: this.props.value
        });
    }

    public onBlur(event) {
        if (!this.state.inFocus)
            return;

        this.onSuccess(false, this.state.newValue);
    }
    public onEnter(event: React.KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.onSuccess(this.state.inFocus, this.state.newValue);
    }

    public onSuccess(inFocus: boolean, newValue: T) {
        if (this.props.onSuccess && this.props.value != newValue)
            this.props.onSuccess(newValue);

        this.setState({
            inFocus: inFocus,
            newValue: newValue,
            oldValue: newValue
        });
    }

    public onEscape(event: React.KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.onCancel(this.state.inFocus)
    }

    public onCancel(inFocus: boolean) {
        this.setState({
            inFocus: inFocus,
            newValue: this.state.oldValue,
            oldValue: this.state.oldValue
        });
    }
}
