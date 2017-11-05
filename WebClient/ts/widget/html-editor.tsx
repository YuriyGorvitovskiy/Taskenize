import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SanitizeHTML from "sanitize-html";

export interface IProps extends React.Props<Component> {
    singleLine: boolean;
    html: string;
    className: string;

    onChange?: (htmlNew: string) => any;
    onSuccess?: (htmlNew: string) => any;
    onCancel?: (htmlOld: string) => any;
}

interface IState {
    htmlNew: string;
    htmlOld: string;
    inFocus: boolean;
}

export class Component extends React.Component<IProps, IState> {

    protected counter: number = 0;

    public constructor() {
        super();
        this.state = {
            htmlNew: "",
            htmlOld: "",
            inFocus: false,
        };
    }

    public render() {
        const html = this.state.inFocus ? this.state.htmlNew : this.props.html;
        const innerHtml = {
            __html: this.sanitizeHTML(html),
        };
        return (
            <div
                id={"counter" + ++this.counter}
                className={this.props.className}
                contentEditable={true}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onPaste={this.onPaste}
                onKeyDown={this.onKeyPress}
                onInput={this.onChange}
                dangerouslySetInnerHTML={innerHtml}
            />
        );
    }

    public shouldComponentUpdate(nextProps: IProps, nextState: IState) {
        const html = nextState.inFocus ? nextState.htmlNew : nextProps.html;
        const target = ReactDOM.findDOMNode(this);
        return (html !== target.innerHTML);
    }

    public componentDidUpdate() {
        const html = this.state.inFocus ? this.state.htmlNew : this.props.html;
        const target = ReactDOM.findDOMNode(this);

        if (html !== target.innerHTML) {
            target.innerHTML = html;
        }
    }

    protected onFocus = (event) => {
        if (this.state.inFocus) {
            return;
        }

        this.setState({
            htmlNew: this.props.html,
            htmlOld: this.props.html,
            inFocus: true,
        });
    }

    protected onBlur = (event) => {
        if (!this.state.inFocus) {
            return;
        }

        if (this.props.onSuccess) {
            this.props.onSuccess(this.state.htmlNew);
        }

        this.setState({
            htmlNew: this.state.htmlNew,
            htmlOld: this.state.htmlNew,
            inFocus: false,
        });
    }

    protected onPaste = (ev: React.ClipboardEvent<any>) => {
        ev.preventDefault();
        let html = ev.clipboardData.getData("text/html");
        if (!html) {
            html = ev.clipboardData.getData("text/plain");

            // tslint:disable-next-line:max-line-length
            const regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
            html = html.replace(regexToken, "<a href=\"$1\">$1</a>");
        }
        if (!html) {
            return;
        }

        this.replaceCurrentSelection(this.sanitizeHTML(html));

        const target = ReactDOM.findDOMNode(this);
        this.setState({
            htmlNew: target.innerHTML,
            htmlOld: this.state.htmlOld,
            inFocus: this.state.inFocus,
        });

        if (this.props.onChange) {
            this.props.onChange(this.state.htmlNew);
        }
    }

    protected onKeyPress = (event: React.KeyboardEvent<any>) => {
        switch (event.keyCode) {
            case 13: // enter
                if (this.props.singleLine || event.altKey) {
                    this.onEnter(event);
                }
                break;
            case 27: // escape
                this.onEscape(event);
                break;
        }
    }
    protected onEnter(event: React.KeyboardEvent<any>) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({
            htmlNew: this.state.htmlNew,
            htmlOld: this.state.htmlNew,
            inFocus: this.state.inFocus,
        });

        if (this.props.onSuccess) {
            this.props.onSuccess(this.state.htmlNew);
        }
    }

    protected onEscape(event: React.KeyboardEvent<any>) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({
            htmlNew: this.state.htmlOld,
            htmlOld: this.state.htmlOld,
            inFocus: this.state.inFocus,
        });

        if (this.props.onChange) {
            this.props.onChange(this.state.htmlOld);
        }
        if (this.props.onCancel) {
            this.props.onCancel(this.state.htmlOld);
        }
    }

    protected onChange = (event: React.FormEvent<any>) => {
        const target = ReactDOM.findDOMNode(this);
        this.setState({
            htmlNew: target.innerHTML,
            htmlOld: this.state.htmlOld,
            inFocus: this.state.inFocus,
        });

        if (this.props.onChange) {
            this.props.onChange(this.state.htmlNew);
        }
    }

    protected replaceCurrentSelection(html: string) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const fragment = range.createContextualFragment("");
        $("<span>" + html + "</span>").each((index: number, element: Element) => {
            fragment.appendChild(element);
        });
        const replacementEnd = fragment.lastChild;
        range.insertNode(fragment);

        // Set cursor at the end of the replaced content, just like browsers do.
        range.setStartAfter(replacementEnd);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    protected sanitizeHTML(html: string) {
        const options = $.extend(true, {}, SanitizeHTML.defaults, {
            allowedAttributes: {
                a: ["contenteditable", "href", "name", "target"],
            },
            allowedTags: [
                "img",
            ],
            transformTags: {
                a: (tagName, attribs) => {
                    return {
                        attribs: $.extend({}, attribs, {
                            contenteditable: "false",
                            target: "_blank",
                        }),
                        tagName,
                    };
                },
            },
        });
        return SanitizeHTML(html, options);
    }

}
