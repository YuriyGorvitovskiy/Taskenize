import * as React from 'react';

import * as Input from './input-v2';

import * as TextUtil from '../util/text';

export class Component extends Input.Component<Date> {

    public renderInput() {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        var text = TextUtil.formatInputDateTimeLocal(value, true);
        return (
            <input  id={this.props.id}
                    className={this.props.className}
                    type="datetime-local"
                    step="1"
                    onFocus={this.onFocus.bind(this)}
                    onBlur={this.onBlur.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)}
                    onChange={this.onChange.bind(this)}
                    value={text}
                    />
        );
    }

    public extractValue(domElement: EventTarget) : Date {
        return TextUtil.parseDate(domElement['value']) || this.props.value;
    }

    public shouldComponentUpdate(nextProps: Input.Props<Date>, nextState: Input.State<Date>) {
        var value = nextState.inFocus ? nextState.newValue : nextProps.value;
        var target = this.getInputElement();

        return (!value || value !== this.extractValue(target));
    }

    public componentDidUpdate() {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        var target = this.getInputElement();

        if (!value || value !== this.extractValue(target))
            target['value'] = TextUtil.formatInputDateTimeLocal(value, true);
    }
}
