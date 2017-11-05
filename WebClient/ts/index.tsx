import "./bootstrap";

import * as React from "react";
import * as ReactDOM from "react-dom";

import * as CompletedPage from "./widget/completed-page";
import {ExecutionPage} from "./widget/execution-page";
import * as Nav from "./widget/navigation-bar";

interface IState {
    pageId: Nav.PageId;
}

class IndexPage extends React.Component<{}, IState> {
    public constructor() {
        super();
        this.state = {
            pageId: Nav.PageId.EXECUTION,
        };
    }

    public render() {
        let pageComponent: any = null;
        switch (this.state.pageId) {
            case Nav.PageId.EXECUTION:
                pageComponent = (<ExecutionPage />);
                break;
            case Nav.PageId.COMPLETED:
                pageComponent = (<CompletedPage.Component />);
                break;
        }
        return (
            <div>
                <Nav.NavigationBar active={this.state.pageId} onPage={this.onPageSelected}/>
                <div style={{marginTop: "70px"}}>
                    {pageComponent}
                </div>
            </div>
        );
    }

    public onPageSelected = (pageId: Nav.PageId) => {
        this.setState({
            pageId,
        });
        this.forceUpdate();
    }
}

ReactDOM.render(
    <div>
        <IndexPage />
    </div>,
    document.getElementById("react-root"),
);
