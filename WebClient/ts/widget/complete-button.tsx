import * as Moment from "moment";
import * as React from "react";

import * as Model from "../model/task";
import * as TextUtil from "../util/text";

import * as Timer from "./timer";

export interface IProps extends React.Props<Component> {
    task: Model.ITask;
    onComplete: () => any;
    onPause: () => any;
}

export abstract class Component extends React.Component<IProps, {}> {

    protected imageSuffix: string;

    public constructor(imageSuffix: string) {
        super();
        this.imageSuffix = imageSuffix;
    }

    public render() {
        const complete = (this.props.task.state === Model.State.COMPLETED);
        const category = Model.Category.MAP[this.props.task.category];
        return (
            <a href="#" className="complete" onClick={this.onClick}>
                <span className={"glyphicon glyphicon-" + (category ? category.glyph : "")} />
                <img src={"images/" + (complete ? "completed" : "incomplete") + this.imageSuffix + ".png"} />
            </a>
        );
    }

    public onClick = (ev: React.MouseEvent<any>) => {
        ev.preventDefault();
        if (this.props.task.state === Model.State.COMPLETED) {
            this.props.onPause();
        } else {
            this.props.onComplete();
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Narrow extends Component {
    public constructor() {
        super("-sm");
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Wide extends Component {
    public constructor() {
        super("");
    }
}
