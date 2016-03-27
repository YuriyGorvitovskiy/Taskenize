import * as React from 'react';
import * as Moment from 'moment';

import * as TaskWide from './task-wide';
import * as TaskNarrow from './task-narrow';
import * as Model from '../model/report';

import * as StyleUtil from '../util/style';
import * as TextUtil from '../util/text';

const sanitizeHTML = require('sanitize-html');

interface State {
    ancor: Model.Ancor;
    range: Model.Range;
    group_by: Model.Property;
    reports: Model.Report[];
}

const anchorLabel : {[key:number]: string} = {};
anchorLabel[Model.Ancor.NOW] = 'Up to now';
anchorLabel[Model.Ancor.CURRENT] = 'Current';
anchorLabel[Model.Ancor.LAST] = 'Last';

const rangeLabel : {[key:number]: string} = {};
rangeLabel[Model.Range.DAY] = 'Day';
rangeLabel[Model.Range.WEEK] = 'Week';
rangeLabel[Model.Range.MONTH] = 'Month';

const propertyLabel : {[key:number]: string} = {};
propertyLabel[Model.Property.CONTEXT] = 'Context';
propertyLabel[Model.Property.CATEGORY] = 'Category';
propertyLabel[Model.Property.PROJECT] = 'Project';
propertyLabel[Model.Property.STORY] = 'Story';
propertyLabel[Model.Property.TASK] = 'Task';

export class Component extends React.Component<{},State> {
    public constructor() {
        super();
        this.requestReport(Model.Ancor.LAST, Model.Range.DAY, Model.Property.CATEGORY);
    }

    public render() {
        var ancor = anchorLabel[this.state.ancor];
        var range = rangeLabel[this.state.range];
        var group_by = propertyLabel[this.state.group_by];
        var reportRows = [];
        $.each(this.state.reports, (index, report) => {
            reportRows.push(
                <tr className="report-group" key={index}>
                    <td className="title">{report.title}</td>
                    <td className="duration">{TextUtil.formatDuration(report.duration)}</td>
                </tr>
            );
            $.each(report.reports, (subIndex, subReport) => {
                var innerHtml = {__html:sanitizeHTML(subReport.title)};
                reportRows.push(
                    <tr className="report-sub" key={index + "-" + subIndex}>
                        <td className="title"><span dangerouslySetInnerHTML={innerHtml}></span></td>
                        <td className="duration">{TextUtil.formatDuration(subReport.duration)}</td>
                    </tr>
                );
            });
        });
        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button type="button"
                                    className="col-xs-12 btn btn-info dropdown-toggle"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false">
                                {ancor} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#" onClick={this.onAncorClick.bind(this, Model.Ancor.NOW)}>
                                    {anchorLabel[Model.Ancor.NOW]}
                                </a></li>
                                <li><a href="#" onClick={this.onAncorClick.bind(this, Model.Ancor.CURRENT)}>
                                    {anchorLabel[Model.Ancor.CURRENT]}
                                </a></li>
                                <li><a href="#" onClick={this.onAncorClick.bind(this, Model.Ancor.LAST)}>
                                    {anchorLabel[Model.Ancor.LAST]}
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button type="button"
                                    className="col-xs-12 btn btn-primary dropdown-toggle"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false">
                                {range} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#" onClick={this.onRangeClick.bind(this, Model.Range.DAY)}>
                                    {rangeLabel[Model.Range.DAY]}
                                </a></li>
                                <li><a href="#" onClick={this.onRangeClick.bind(this, Model.Range.WEEK)}>
                                    {rangeLabel[Model.Range.WEEK]}
                                </a></li>
                                <li><a href="#" onClick={this.onRangeClick.bind(this, Model.Range.MONTH)}>
                                    {rangeLabel[Model.Range.MONTH]}
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-xs-4 btn-group">
                        <div className="row">
                            <button type="button"
                                    className="col-xs-12 btn btn-success dropdown-toggle"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false">
                                {group_by} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Model.Property.CONTEXT)}>
                                    {propertyLabel[Model.Property.CONTEXT]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Model.Property.CATEGORY)}>
                                    {propertyLabel[Model.Property.CATEGORY]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Model.Property.PROJECT)}>
                                    {propertyLabel[Model.Property.PROJECT]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Model.Property.STORY)}>
                                    {propertyLabel[Model.Property.STORY]}
                                </a></li>
                                <li><a href="#" onClick={this.onPropertyClick.bind(this, Model.Property.TASK)}>
                                    {propertyLabel[Model.Property.TASK]}
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="row"><br/></div>
                <div className="row">
                    <table className="table report"><tbody>
                        {reportRows}
                    </tbody></table>
                </div>
            </div>
        );
    }

    public onAncorClick(ancor: Model.Ancor, ev: React.MouseEvent) {
        ev.preventDefault();
        this.requestReport(ancor, this.state.range, this.state.group_by);
    }

    public onRangeClick(range: Model.Range, ev: React.MouseEvent) {
        ev.preventDefault();
        this.requestReport(this.state.ancor, range, this.state.group_by);
    }

    public onPropertyClick(group_by: Model.Property, ev: React.MouseEvent) {
        ev.preventDefault();
        this.requestReport(this.state.ancor, this.state.range, group_by);
    }

    public requestReport(ancor: Model.Ancor, range: Model.Range, group_by: Model.Property) {
        var newState : State = {
            ancor: ancor,
            range: range,
            group_by: group_by,
            reports: []
        };
        if (this.state == null)
            this.state = newState;
        else
            this.setState(newState);

        Model.get(Model.calculatePeriod(ancor, range), group_by).done(((serverReport) => {
            var reports = serverReport as Model.Report[];
            Model.sort(reports, Model.reportComparator);
            this.setState({
                ancor: ancor,
                range: range,
                group_by: group_by,
                reports: reports
            });
        }).bind(this));
    }
}
