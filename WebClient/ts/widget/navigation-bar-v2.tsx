import * as $ from 'jquery';
import * as React from 'react';
import * as Model from '../model/user';

export enum PageId {
    REVIEW,
    EXECUTION,
    COMPLETED,
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
            .addPage(PageId.COMPLETED,  "Completed")
            .addPage(PageId.REPORT,     "Report")
        ;
    }

    addPage(id: PageId, name: string) : NavigationInfo {
        this.pages.push(new Page(id, name));
        return this;
    }

    public static instance: NavigationInfo = new NavigationInfo();
}

export interface Props extends React.Props<Component> {
    active : PageId;
    back : string;

    onPage : (pageId: PageId) => void;
    onBack : () => void;
}

export interface State {
    user : Model.User;
}

export class Component extends React.Component<Props,State> {
    public constructor() {
        super();
        this.state = {
            user: null
        };

        Model.get().done(((user) => {
            this.setState({user});
        }).bind(this));
    }

    public render() {
        var active = this.props.active;
        var backButton = null;
        if (this.props.back != null) {
            backButton =
                <nav className="tz-collapse" onClick={this.onBack.bind(this)}>
                    <span className="tz-glyph">{"\ue079"}</span>{this.props.back}
                </nav>;
        }
        var collapsableMenu = [];
        $.each(NavigationInfo.instance.pages, (index: number, page: Page) => {
            collapsableMenu.push(
                <nav className={active == page.id ? 'tz-active' : ''} onClick={this.onPageMenu.bind(this, page)} key={index}>
                    {page.name}
                </nav>
            );
        });
        var userIcon = null;
        if (this.state.user != null && this.state.user.image != null) {
            userIcon =
                <img className="tz-img-circle"
                        src={this.state.user.image}
                        alt={this.state.user.display_name}
                        title={this.state.user.display_name}/>;
        }
        collapsableMenu.push(
            <nav key="user-logout"><a href="/logout" >{userIcon} Logout</a></nav>
        );
        return (
            <header>
                {backButton}
                <h1>Taskenize</h1>
                <span className="tz-collapseable">
                    <nav className="tz-collapse tz-glyph">{"\ue236"}</nav>
                    <section>
                        {collapsableMenu}
                    </section>
                </span>
            </header>
        );
    }

    onPageMenu(page: Page, ev: React.MouseEvent) {
        ev.preventDefault();
        ev.stopPropagation();
        this.props.onPage(page.id);
    }

    onBack(ev: React.MouseEvent) {
        ev.preventDefault();
        this.props.onBack();
    }
}
