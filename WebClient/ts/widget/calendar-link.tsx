import * as $ from 'jquery';
import * as Moment from 'moment';
import * as React from 'react';

export interface Props extends React.Props<Component> {
    id:         string;
    date:       Date;
    onChange:   (neDate: Date) => any;
};

const FORMAT = 'MM/DD/YYYY';

export class Component extends React.Component<Props, {}> {
    schedule_btn_id: string;
    schedule_cal_id: string;

    public constructor() {
        super();
        this.state = {
        }
    }

    public componentDidMount() {
        var item: any = $("#" + this.schedule_btn_id);
        item.popover();
        item.on('inserted.bs.popover', () => {
            var picker: any = $("#" + this.schedule_cal_id);
            picker.datepicker({
                startDate: new Date(),
                todayBtn: true,
                todayHighlight: true,
                weekStart: 1
            });
            picker.datepicker().on('changeDate', this.onChangeDate.bind(this));
            $('html').click(this.onBlur.bind(this));
            picker.click(function(event){
                event.stopPropagation();
            });
        });
        item.on('hidden.bs.popover', () => {
            $('html').unbind('click');
        });
    }

    public render() {
        this.schedule_btn_id = "schedule-btn-id-" + this.props.id;
        this.schedule_cal_id = "schedule-cal-id-" + this.props.id;
        var date = Moment(this.props.date || new Date()).format(FORMAT);

        return (
            <a  href="#"
                id={this.schedule_btn_id}
                onClick={this.onClick.bind(this)}
                data-container="body"
                data-toggle="popover"
                data-placement="auto top"
                data-trigger="manual"
                data-content={'<div id="' + this.schedule_cal_id + '" data-date="' + date + '" ></div>'}
                data-html={true}>
                <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
            </a>
        );
    }
    public onClick(ev: any) {
        ev.preventDefault();
        ev.stopPropagation();
        var item: any = $("#" + this.schedule_btn_id);
        item.popover('show');
    }

    public onBlur(ev: any) {
        ev.stopPropagation();
        var item: any = $("#" + this.schedule_btn_id);
        item.popover('hide');
    }

    public onChangeDate(ev: any) {
        var newMoment = Moment(ev.date);
        var oldMoment = Moment(this.props.date || new Date());
        newMoment.hour(oldMoment.hour());
        newMoment.second(oldMoment.second());

        var item: any = $("#" + this.schedule_btn_id);
        item.popover('hide');

        if (this.props.onChange)
            this.props.onChange(newMoment.toDate());
    }
}
