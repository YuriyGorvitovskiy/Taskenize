import * as React from "react";

export interface IProps extends React.Props<Component> {
    text: string;
    className: string;
    placeholder?: string;
    onSuccess?: (text: string) => any;
}

interface IState {
    text: string;
    inFocus: boolean;
}

export class Component extends React.Component<IProps, IState> {

    public constructor() {
        super();
        this.state = {
            inFocus: false,
            text: "",
        };
    }

    public render() {
        const value = this.state.inFocus ? this.state.text : this.props.text;
        return (
            <input
                type="text"
                className={this.props.className}
                value={value}
                placeholder={this.props.placeholder}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onKeyDown={this.onKeyPress}
                onChange={this.onChange}
            />
        );
    }

    protected onFocus = (event: React.FocusEvent<any>) => {
        if (this.state.inFocus) {
            return;
        }

        this.setState({
            inFocus: true,
            text: this.props.text,
        });
    }

    protected onBlur = (event: React.FocusEvent<any>) => {
        if (!this.state.inFocus) {
            return;
        }

        if (this.props.onSuccess) {
            this.props.onSuccess(this.state.text);
        }

        this.setState({
            inFocus: false,
            text: this.state.text,
        });
    }

    protected onKeyPress = (event: React.KeyboardEvent<any>) => {
        switch (event.keyCode) {
            case 13: // enter
                this.onEnter(event);
                break;
            case 27: // escape
                this.onEscape(event);
                break;
        }
    }
    protected onEnter(event: React.KeyboardEvent<any>) {
        event.preventDefault();
        event.stopPropagation();

        if (this.props.onSuccess) {
            this.props.onSuccess(this.state.text);
        }
    }

    protected onEscape(event: React.KeyboardEvent<any>) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({
            inFocus: this.state.inFocus,
            text: this.props.text,
        });
    }

    protected onChange = (event: React.ChangeEvent<any>) => {
        this.setState({
            inFocus: this.state.inFocus,
            text: event.target.value,
        });
    }
}
