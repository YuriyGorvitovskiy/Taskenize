import * as $ from 'jquery';
import * as React from 'react';

export interface InboxItem {
    name:   string;
}

export interface InboxGroup {
    id:     string;
    name:   string;
    items:  InboxItem[];
    active: number;
}

export interface InboxListProp extends React.Props<InboxList> {
    id:     string;
    groups: InboxGroup[];
    active: number;
}

export class InboxList extends React.Component<InboxListProp,{}> {
    public constructor() {
        super();
    }

    public render() {
        var panels = [];
        var props = this.props;
        $.each(this.props.groups, (idxGroup: number, group: InboxGroup) => {
            var rows = [];
            $.each(group.items, (idxItem: number, item: InboxItem) => {
                rows.push(<tr className={group.active == idxItem ? "info" : ""} key={idxItem}><td>{item.name}</td></tr>);
            });
            var isActive = (props.active == idxGroup);
            panels.push(
                <div className={"panel panel-" + (isActive ? "primary" : "default")} key={idxGroup} >
                    <div className="panel-heading">
                        <h4 className="panel-title">
                            <a data-toggle="collapse" data-parent={"#" + props.id} href={"#" + group.id} >
                                <span className="badge" style={{float:"right"}}>{rows.length}</span>
                                {group.name}
                            </a>
                        </h4>
                    </div>
                    <div id={group.id} className={"panel-collapse collapse" + (isActive ? " in" : "")} >
                        <table className="table">
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        });
        return (
            <div className="panel-group" id={props.id}>
                {panels}
            </div>
        );
    }
}
