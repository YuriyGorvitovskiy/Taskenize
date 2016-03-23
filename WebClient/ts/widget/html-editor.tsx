import * as $ from 'jquery';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
const sanitizeHTML = require('sanitize-html');

export interface Props extends React.Props<Component> {
    singleLine: boolean;
    html:       string;
    className:  string;

    onChange?:  (htmlNew: string) => any;
    onSuccess?: (htmlNew: string) => any;
    onCancel?:  (htmlOld: string) => any;
}

interface State {
    htmlNew: string;
    htmlOld: string;
    inFocus: boolean;
}

export class Component extends React.Component<Props, State> {
    counter: number = 0;
    public constructor() {
        super();
        this.state = {
            htmlNew: "",
            htmlOld: "",
            inFocus: false
        };
    }

    public render() {
        var html = this.state.inFocus ? this.state.htmlNew : this.props.html;
        var innerHtml = {__html:this.sanitizeHTML(html)};
        return (
            <div
                id={"counter" + ++this.counter}
                className={this.props.className}
                contentEditable={true}
                onFocus={this.onFocus.bind(this)}
                onBlur={this.onBlur.bind(this)}
                onPaste={this.onPaste.bind(this)}
                onKeyDown={this.onKeyPress.bind(this)}
                onInput={this.onChange.bind(this)}
                dangerouslySetInnerHTML={innerHtml}
                >
            </div>
        );
    }

    public shouldComponentUpdate(nextProps: Props, nextState: State) {
        var html = nextState.inFocus ? nextState.htmlNew : nextProps.html;
        var target = ReactDOM.findDOMNode(this);
        return (html !== target['innerHTML']);
    }
    public componentDidUpdate() {
        var html = this.state.inFocus ? this.state.htmlNew : this.props.html;
        var target = ReactDOM.findDOMNode(this);

        if (html !== target['innerHTML'])
            target['innerHTML'] = html;
    }

    public onFocus(event) {
        if (this.state.inFocus)
            return;

        this.setState({
            inFocus: true,
            htmlNew: this.props.html,
            htmlOld: this.props.html
        });
    }
    public onBlur(event) {
        if (!this.state.inFocus)
            return;

        if (this.props.onSuccess)
            this.props.onSuccess(this.state.htmlNew);

        this.setState({
            inFocus: false,
            htmlNew: this.state.htmlNew,
            htmlOld: this.state.htmlNew
        });
    }
    public onPaste(ev : React.ClipboardEvent) {
        ev.preventDefault();
        var html = ev.clipboardData.getData('text/html');
        if (!html) {
            html = ev.clipboardData.getData('text/plain');

            var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
            html = html.replace(regexToken, '<a href="$1">$1</a>');
        }
        if (!html)
            return;

        this.replaceCurrentSelection(this.sanitizeHTML(html));

        var target = ReactDOM.findDOMNode(this);
        this.setState({
            inFocus: this.state.inFocus,
            htmlNew: target['innerHTML'],
            htmlOld: this.state.htmlOld
        });

        if (this.props.onChange)
            this.props.onChange(this.state.htmlNew);

    }

    public onKeyPress(event: React.KeyboardEvent) {
        switch(event.keyCode) {
            case 13: //enter
                if (this.props.singleLine || event.altKey)
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
            htmlNew: this.state.htmlNew,
            htmlOld: this.state.htmlNew
        });

        if (this.props.onSuccess)
            this.props.onSuccess(this.state.htmlNew);
    }

    public onEscape(event: React.KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({
            inFocus: this.state.inFocus,
            htmlNew: this.state.htmlOld,
            htmlOld: this.state.htmlOld
        });

        if (this.props.onChange)
            this.props.onChange(this.state.htmlOld);

        if (this.props.onCancel)
            this.props.onCancel(this.state.htmlOld);
    }

    public onChange(event: React.FormEvent) {
        var target = ReactDOM.findDOMNode(this);
        this.setState({
            inFocus: this.state.inFocus,
            htmlNew: target['innerHTML'],
            htmlOld: this.state.htmlOld
        });

        if (this.props.onChange)
            this.props.onChange(this.state.htmlNew);
    }

    private replaceCurrentSelection(html: string) {
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        range.deleteContents();
        var fragment = range.createContextualFragment('');
        $('<span>' + html + '</span>').each((index: number, element: Element) => {
            fragment.appendChild(element);
        });
        var replacementEnd = fragment.lastChild;
        range.insertNode(fragment);

        // Set cursor at the end of the replaced content, just like browsers do.
        range.setStartAfter(replacementEnd);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    public sanitizeHTML(html: string) {
        var options = $.extend(true, {}, sanitizeHTML['defaults'], {
            allowedTags :[
                'img'
            ],
            allowedAttributes: {
                a: [ 'contenteditable', 'href', 'name', 'target' ]
            },
            transformTags: {
                'a': (tagName, attribs) => {
                    return {
                        tagName,
                        attribs: $.extend({}, attribs, {
                            contenteditable:"false",
                            target:"_blank"
                        })
                    };
                }
            }
        });
        return sanitizeHTML(html,options);
    }

}
