import * as React from 'react';

import * as Input from './input-v2';

const sanitizeHTML = require('sanitize-html');

export class Component extends Input.Component<string> {
    public renderInput() : JSX.Element {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        var innerHtml = {__html:this.sanitizeHTML(value)};

        return (
            <div id={this.props.id}
                 className={"tz-input tz-multiline " + (this.props.className || "")}
                 onFocus={this.onFocus.bind(this)}
                 onBlur={this.onBlur.bind(this)}
                 onKeyDown={this.onKeyDown.bind(this)}
                 onInput={this.onChange.bind(this)}
                 onPaste={this.onPaste.bind(this)}
                 dangerouslySetInnerHTML={innerHtml}
                 contentEditable
                 required
            />
        );
    }

    public extractValue(domElement: EventTarget) : string {
        return domElement['innerHTML'];
    }

    public updateValue(domElement: EventTarget, value: string) : any {
        domElement['innerHTML'] = value;
    }

    public shouldComponentUpdate(nextProps: Input.Props<string>, nextState: Input.State<string>) {
        var html = nextState.inFocus ? nextState.newValue : nextProps.value;
        var target = this.getInputElement();

        return (html !== this.extractValue(target));
    }

    public componentDidUpdate() {
        var value = this.state.inFocus ? this.state.newValue : this.props.value;
        var target = this.getInputElement();

        if (value !== this.extractValue(target))
            this.updateValue(target, value);
    }

    public onKeyDown(event: React.KeyboardEvent) {
        if (event.keyCode != 13)
            return super.onKeyDown(event);

        if(event.altKey)
            this.onEnter(event);
    }

    public onSuccess(inFocus: boolean, newValue: string) {
        super.onSuccess(inFocus, this.sanitizeHTML(newValue));
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
