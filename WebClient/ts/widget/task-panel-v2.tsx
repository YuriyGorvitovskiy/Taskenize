import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

class Props {
    task: Model.Task;
}

export class Component extends React.Component<Props, {}> {
    public render() {
        var glyph = "\ue021";
        switch (this.props.task.category) {
            case "House":
                glyph = "\ue021";
                break;
            case "Hobby":
                glyph = "\ue184";
                break;
            case "Recreation":
                glyph = "\u26fa";
                break;
            case "Shop":
                glyph = "\ue116";
                break;
            case "Education":
                glyph = "\ue233";
                break;
            case "Pleasure":
                glyph = "\ue059";
                break;
        }
        return (
            <article className="task">
                <a className="action-complete" href="#">
                    <span className="category-icon">{glyph}</span>
                    <span className="state completed"></span>
                </a>
                <a className="action-pause" href="#">
                    <span className="duration">{TextUtil.formatDuration(Model.calculateDuration(this.props.task))}</span>
                    <span className="pause"></span>
                </a>
                <div className="info">
                    <div className="title">{this.props.task.title}</div>
                    <div className="subject" dangerouslySetInnerHTML={{__html:this.props.task.subject}} ></div>
                    <div className="extra">
                        <div className="classification">
                            <span className="label">x:</span>
                            <span className="value">{this.props.task.context}</span>
                        </div>
                        <div className="classification">
                            <span className="label">c:</span>
                            <span className="value">{this.props.task.category}</span>
                        </div>
                        <div className="classification">
                            <span className="label">p:</span>
                            <span className="value">{this.props.task.project}</span>
                        </div>
                        <div className="classification">
                            <span className="label">s:</span>
                            <span className="value">{this.props.task.story}</span>
                        </div>
                    </div>
                </div>
            </article>
        );
    }
}
