import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as TextUtil from '../util/text';

import * as Timer from './timer';

export interface Props extends React.Props<Component> {
    task:    Model.Task;
    onComplete: () => any;
    onPause:    () => any;
};

abstract class Component extends React.Component<Props, {}> {
    image_suffix: string
    public constructor(image_suffix: string) {
        super();
        this.image_suffix = image_suffix;
    }

    public render() {
        var complete = (this.props.task.state == Model.State.COMPLETED);
        var category = Model.Category.MAP[this.props.task.category];
        return (
            <a href="#" className="complete" onClick={this.onClick.bind(this)}>
                <span className={"glyphicon glyphicon-" + (category ? category.glyph : "")}></span>
                <img src={"images/" + (complete ? "completed" : "incomplete") + this.image_suffix + ".png"} />
            </a>
        );
    }

    public onClick(ev : React.MouseEvent) {
        ev.preventDefault();
        if (this.props.task.state == Model.State.COMPLETED)
            this.props.onPause();
        else
            this.props.onComplete();
    }
}

export class Narrow extends Component {
    public constructor() {
        super("-sm");
    }
}

export class Wide extends Component {
    public constructor() {
        super("");
    }
}
