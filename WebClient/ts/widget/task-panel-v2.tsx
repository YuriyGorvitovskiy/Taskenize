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
            <article className="tz-task">
                <a className="tz-action-complete" href="#">
                    <span className="tz-category-icon">{glyph}</span>
                    <span className="tz-state tz-completed"></span>
                </a>
                <a className="tz-action-pause" href="#">
                    <span className="tz-duration">{TextUtil.formatDuration(Model.calculateDuration(this.props.task))}</span>
                    <span className="tz-pause"></span>
                </a>
                <div className="tz-info">
                    <div className="tz-title">{this.props.task.title}</div>
                    <div className="tz-subject" dangerouslySetInnerHTML={{__html:this.props.task.subject}} ></div>
                    <div className="tz-extra">
                        <div className="tz-classification">
                            <span className="tz-label">x:</span>
                            <span className="tz-value">{this.props.task.context}</span>
                        </div>
                        <div className="tz-classification">
                            <span className="tz-label">c:</span>
                            <span className="tz-value">{this.props.task.category}</span>
                        </div>
                        <div className="tz-classification">
                            <span className="tz-label">p:</span>
                            <span className="tz-value">{this.props.task.project}</span>
                        </div>
                        <div className="tz-classification">
                            <span className="tz-label">s:</span>
                            <span className="tz-value">{this.props.task.story}</span>
                        </div>
                    </div>
                </div>
            </article>
        );
    }
}
