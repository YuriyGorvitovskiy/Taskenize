import * as $ from 'jquery';
import * as React from 'react';

export enum PageId {
    REVIEW,
    EXECUTION,
    REPORT
}

class Page {

    public id:   PageId;
    public name: string;

    constructor(id: PageId, name: string) {
        this.id   = id;
        this.name = name;
    }
}

export class NavigationInfo {
    pages:   Page[] = [];

    constructor() {
        this.addPage(PageId.REVIEW,     "Review")
            .addPage(PageId.EXECUTION,  "Execution")
            .addPage(PageId.REPORT,     "Report")
        ;
    }

    addPage(id: PageId, name: string) : NavigationInfo {
        this.pages.push(new Page(id, name));
        return this;
    }

    public static instance: NavigationInfo = new NavigationInfo();
}

export interface INavigationBarProps extends React.Props<NavigationBar> {
    active : PageId;

    onPage : (pageId: PageId) => void;
}

export class NavigationBar extends React.Component<INavigationBarProps,{}> {
    public render() {
        var topMenu = [];
        var active = this.props.active;
        var onPage = this.props.onPage;
        $.each(NavigationInfo.instance.pages, (index: number, page: Page) => {
            topMenu.push(<li className={active == page.id ? 'active' : ''} key={index}>
                <a href="#" onClick={(evt)=>{evt.preventDefault();onPage(page.id);}} >{page.name}</a>
            </li>);
        });
        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type = "button" className = "navbar-toggle" data-toggle = "collapse" data-target = "#navbar-collapse" style={{padding:"5px"}}>
                            <span className = "sr-only">Toggle navigation</span>
                            <span className = "glyphicon glyphicon-menu-hamburger" style={{marginLeft:"3px", marginRight:"3px", fontSize:"large"}}></span>
                        </button>
                        <span className="navbar-brand" >Taskenize</span>
                    </div>
                    <div id="navbar-collapse" className="collapse navbar-collapse">
                      <ul className="nav navbar-nav navbar-right ">
                          {topMenu}
                      </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
