import * as $ from 'jquery';
import * as React from 'react';
import * as Moment from 'moment';

import * as Model from '../model/task';
import * as Complete from './complete-button';
import * as Play from './timer-button-narrow';
import * as Timer from './timer';
import * as HtmlEditor from './html-editor';

export interface Props extends React.Props<Component> {
    task: Model.Task;
};

interface State {
}

export class Component extends React.Component<Props, State> {
    public constructor() {
        super();
        this.state = {
        }
    }

    public onComplete() {

    }

    public onPause() {

    }

    public onPlay() {

    }

    public onTitleChange() {

    }

    public onSubjectChange() {

    }
    public onContextChange() {

    }
    public onCategoryChange() {

    }
    public onProjectChange() {

    }
    public onStoryChange() {

    }

    public onScheduleChange() {
        
    }
};
