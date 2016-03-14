import * as $ from 'jquery';
import * as Moment from 'moment';
import * as React from 'react';
import * as Model from '../model/task';
import * as Calendar from './calendar-button';
import * as HtmlEditor from './html-editor';
import * as Timer from './task-timer';
import * as TextInput from './text-editor';
import * as TextUtil from '../util/text';
import * as StyleUtil from '../util/style';

export interface Props extends React.Props<Component> {
    active: boolean;
    complete: boolean;
    category: Model.Category;
};

interface State {
}

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {
        }
    }

    public componentDidMount() {
    }

    public render() {
        var env = StyleUtil.findBootstrapEnvironment();
        if(env == 'md' || env == 'lg') {
            return (
                <div className={"test-task panel panel-" + (this.props.active ? "primary" : "default")}>
                    <div className={"test-task-inside bg-" + this.props.category.css}>
                        <a href="#" className="test-complete" >
                            <span className={"glyphicon glyphicon-" + this.props.category.glyph}></span>
                            <img src={this.props.complete ? "images/completed.png" : "images/incomplete.png"} />
                        </a>
                        <button className={"test-time-ctrl btn btn-" + (this.props.active ? "primary" : "default")}>
                            <div className="test-timer">1:23:32</div>
                            <div className="test-play"><span className={"glyphicon glyphicon-" + (this.props.active ? "pause": "play")}></span></div>
                        </button>
                        <div className="test-title">This is Task Title</div>
                        <div className="test-subject">This is Task description</div>
                        <div className="test-info">
                            <span className="test-info-cat">
                                <b>Context: </b>Home&nbsp;&bull;&nbsp;
                                <b>Category: </b>{this.props.category.name}&nbsp;&bull;&nbsp;
                                <b>Project: </b>Taskenize&nbsp;&bull;&nbsp;
                                <b>Story: </b>Design&nbsp;
                            </span>
                            <span className="test-info-defer">
                                <b>Defer: </b>Thu 23 Mar 2016 <a href="#">+1</a>&nbsp;<a href="#">+7</a>&nbsp;<a href="#">+30</a>
                            </span>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={"test-task-sm panel panel-" + (this.props.active ? "primary" : "default")}>
                    <div className={"test-task-inside-sm bg-" + this.props.category.css}>
                        <a href="#" className="test-complete-sm" >
                            <span className={"glyphicon glyphicon-" + this.props.category.glyph}></span>
                            <img src={this.props.complete ? "images/completed-sm.png" : "images/incomplete-sm.png"} />
                        </a>
                        <button className={"test-play-sm btn btn-" + (this.props.active ? "primary" : "default")}>
                            <span className={"glyphicon glyphicon-" + (this.props.active ? "pause": "play")}></span>
                        </button>
                        <div className="test-time-sm">1:23:32</div>
                        <div className="test-title-sm">This is long Task Title to deal with in small screen.</div>
                        <div className="test-subject-sm">This is long sunsject title to deal with in small screen.</div>
                    </div>
                </div>
            );
        }
    }

};
