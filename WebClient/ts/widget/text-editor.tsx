import * as $ from 'jquery';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface Props extends React.Props<Component> {
    text:           string;
    className:      string;
    placeholder?:   string;

    onSuccess?:     (text: string) => any;
}

interface State {
    text:    string;
    inFocus: boolean;
}

export class Component extends React.Component<Props, State> {

    public constructor() {
        super();
        this.state = {
            text: "",
            inFocus: false
        };
    }

    public render() {
        var value = this.state.inFocus ? this.state.text : this.props.text;
        return (
            <input
                type="text"
                className={this.props.className}
                value={value}
                placeholder={this.props.placeholder}
                onFocus={this.onFocus.bind(this)}
                onBlur={this.onBlur.bind(this)}
                onKeyDown={this.onKeyPress.bind(this)}
                onChange={this.onChange.bind(this)}
            />
        );
    }

    public onFocus(event) {
        if (this.state.inFocus)
            return;

        this.setState({
            inFocus: true,
            text: this.props.text
        });
    }
    public onBlur(event) {
        if (!this.state.inFocus)
            return;

        if (this.props.onSuccess)
            this.props.onSuccess(this.state.text);

        this.setState({
            inFocus: false,
            text:    this.state.text
        });
    }

    public onKeyPress(event: React.KeyboardEvent) {
        switch(event.keyCode) {
            case 13: //enter
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

        if (this.props.onSuccess)
            this.props.onSuccess(this.state.text);
    }

    public onEscape(event: React.KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({
            inFocus: this.state.inFocus,
            text:    this.props.text
        });
    }

    public onChange(event: React.FormEvent) {
        var target = ReactDOM.findDOMNode(this);
        this.setState({
            inFocus: this.state.inFocus,
            text:    target['value']
        });
    }
}
