import * as $ from "jquery";
import * as React from "react";

import * as Model from "../model/user";

export enum PageId {
    EXECUTION,
    COMPLETED,
}

class Page {

    public id: PageId;
    public name: string;

    constructor(id: PageId, name: string) {
        this.id = id;
        this.name = name;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class NavigationInfo {
    public static instance: NavigationInfo = new NavigationInfo();

    public pages: Page[] = [];

    constructor() {
        this.addPage(PageId.EXECUTION,  "Execution")
            .addPage(PageId.COMPLETED,  "Completed")
        ;
    }

    public addPage(id: PageId, name: string): NavigationInfo {
        this.pages.push(new Page(id, name));
        return this;
    }

}

export interface INavigationBarProps extends React.Props<NavigationBar> {
    active: PageId;

    onPage: (pageId: PageId) => void;
}

export interface INavigationBarState {
    user: Model.IUser;
}

// tslint:disable-next-line:max-classes-per-file
export class NavigationBar extends React.Component<INavigationBarProps, INavigationBarState> {
    public constructor() {
        super();
        this.state = {
            user: null,
        };

        Model.get().done(((user) => {
            this.setState({user});
        }).bind(this));
    }

    public render() {
        const topMenu = [];
        const active = this.props.active;
        const onPage = this.props.onPage;
        $.each(NavigationInfo.instance.pages, (index: number, page: Page) => {
            topMenu.push((
                <li className={active === page.id ? "active" : ""} key={index}>
                    <a
                        href="#"
                        // tslint:disable-next-line:jsx-no-lambda
                        onClick={(ev) => this.onPageMenu(page, ev)}
                    >
                        {page.name}
                    </a>
                </li>
            ));
        });
        if (this.state.user != null && this.state.user.image != null) {
            topMenu.push((
                <li key="user-image">
                    <img
                        className="img-responsive img-circle"
                        src={this.state.user.image}
                        alt={this.state.user.display_name}
                        title={this.state.user.display_name}
                    />
                </li>
            ));
        }
        topMenu.push((
            <li key="user-logout">
                <a href="/logout" >Logout</a>
            </li>
        ));
        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button
                            type="button"
                            className="navbar-toggle"
                            data-toggle="collapse"
                            data-target="#navbar-collapse"
                            // tslint:disable-next-line:jsx-no-multiline-js
                            style={{
                                padding: "5px",
                            }}
                        >
                            <span className="sr-only">Toggle navigation</span>
                            <span
                                className="glyphicon glyphicon-menu-hamburger"
                                // tslint:disable-next-line:jsx-no-multiline-js
                                style={{
                                    fontSize: "large",
                                    marginLeft: "3px",
                                    marginRight: "3px",
                                }}
                            />
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

    protected onPageMenu(page: Page, ev: React.MouseEvent<any>) {
        ev.preventDefault();
        $("#navbar-collapse").collapse("hide");
        this.props.onPage(page.id);
    }
}
