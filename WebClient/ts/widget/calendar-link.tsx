import * as $ from "jquery";
import * as Moment from "moment";
import * as React from "react";

export interface IProps extends React.Props<Component> {
    id: string;
    date: Date;
    onChange: (newDate: Date) => any;
}

const FORMAT = "MM/DD/YYYY";

export class Component extends React.Component<IProps, {}> {
    protected scheduleBtnId: string;
    protected scheduleCalId: string;

    public constructor() {
        super();
    }

    public componentDidMount() {
        const item: any = $("#" + this.scheduleBtnId);
        item.popover();
        item.on("inserted.bs.popover", () => {
            const picker: any = $("#" + this.scheduleCalId);
            picker.datepicker({
                startDate: new Date(),
                todayBtn: true,
                todayHighlight: true,
                weekStart: 1,
            });
            picker.datepicker().on("changeDate", this.onChangeDate);
            $("html").click(this.onBlur);
            picker.click((event) => {
                event.stopPropagation();
            });
        });
        item.on("hidden.bs.popover", () => {
            $("html").unbind("click");
        });
    }

    public render() {
        this.scheduleBtnId = "schedule-btn-id-" + this.props.id;
        this.scheduleCalId = "schedule-cal-id-" + this.props.id;
        const date = Moment(this.props.date || new Date()).format(FORMAT);

        return (
            <a
                href="#"
                id={this.scheduleBtnId}
                onClick={this.onClick}
                data-container="body"
                data-toggle="popover"
                data-placement="auto top"
                data-trigger="manual"
                data-content={"<div id=\"" + this.scheduleCalId + "\" data-date=\"" + date + "\" ></div>"}
                data-html={true}
            >
                <span className="glyphicon glyphicon-calendar" aria-hidden="true" />
            </a>
        );
    }
    public onClick = (ev: React.MouseEvent<any>) => {
        ev.preventDefault();
        ev.stopPropagation();
        const item: any = $("#" + this.scheduleBtnId);
        item.popover("show");
    }

    public onBlur = (ev: any) => {
        ev.stopPropagation();
        const item: any = $("#" + this.scheduleBtnId);
        item.popover("hide");
    }

    public onChangeDate = (ev: any) => {
        const newMoment = Moment(ev.date);
        const oldMoment = Moment(this.props.date || new Date());
        newMoment.hour(oldMoment.hour());
        newMoment.second(oldMoment.second());

        const item: any = $("#" + this.scheduleBtnId);
        item.popover("hide");

        if (this.props.onChange) {
            this.props.onChange(newMoment.toDate());
        }
    }
}
