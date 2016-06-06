import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Input from './input-v2';

export class Component extends Input.Component<string> {

    public renderInput() {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        return (
            <input  id={this.props.id}
                    type="text"
                    className={this.props.className}
                    onFocus={this.onFocus.bind(this)}
                    onBlur={this.onBlur.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)}
                    onChange={this.onChange.bind(this)}
                    value={value}
                    required
                    />
        );
    }

    public extractValue(domElement: EventTarget) : string {
        return domElement['value'];
    }

}
