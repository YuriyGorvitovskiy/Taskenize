import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Input from './input-v2';

import * as TextUtil from '../util/text';
import * as Moment from 'moment';

export class Component extends Input.Component<Date> {

    public renderInput() {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        var text = TextUtil.formatInputDateTimeLocal(value, false);
        return (
            <input  id={this.props.id}
                    type="datetime-local"
                    onFocus={this.onFocus.bind(this)}
                    onBlur={this.onBlur.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)}
                    onChange={this.onChange.bind(this)}
                    value={text}
                    />
        );
    }

    public renderSubAction() {
        var actions : JSX.Element[] = [];

        actions.push(<a className="tz-action tz-plus" href="#" onClick={this.onNext.bind(this, {days:1})}>+1</a>);
        actions.push(<a className="tz-action tz-plus" href="#" onClick={this.onNext.bind(this, {weeks:1})}>+7</a>);
        actions.push(<a className="tz-action tz-plus" href="#" onClick={this.onNext.bind(this, {months:1})}>+30</a>);

        return actions;
    }

    public extractValue(domElement: EventTarget) : Date {
        return TextUtil.parseDate(domElement['value']);
    }

    public shouldComponentUpdate(nextProps: Input.Props<Date>, nextState: Input.State<Date>) {
        var value = nextState.inFocus ? nextState.newValue : nextProps.value;
        var target = ReactDOM.findDOMNode(this).firstElementChild;

        return (!value || value !== this.extractValue(target));
    }

    public componentDidUpdate() {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        var target = ReactDOM.findDOMNode(this).firstElementChild;
        
        if (!value || value !== this.extractValue(target))
            target['value'] = TextUtil.formatInputDateTimeLocal(value, false);
    }

    public onNext(duration: Moment.Duration, event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        var target = ReactDOM.findDOMNode(this).firstElementChild;
        var date = Moment(this.extractValue(target)  || new Date());

        this.onSuccess(this.state.inFocus,
                        Moment.max(date, Moment())
                              .add(duration)
                              .toDate());
    }

}
