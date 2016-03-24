import './bootstrap';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Nav from './widget/navigation-bar';
import {InboxPage} from './widget/inbox-page';
import {ExecutionPage} from './widget/execution-page';
import * as ReportPage from './widget/report-page';

interface IndexPageState {
    pageId: Nav.PageId
}

class IndexPage extends React.Component<{},IndexPageState> {
    public constructor() {
        super();
        this.state={
            pageId: Nav.PageId.EXECUTION
        };
    }

    public render() {
        var pageComponent: any = null;
        switch(this.state.pageId) {
            case Nav.PageId.REVIEW:
                pageComponent = (<InboxPage />);
                break;
            case Nav.PageId.EXECUTION:
                pageComponent = (<ExecutionPage />);
                break;
            case Nav.PageId.REPORT:
                pageComponent = (<ReportPage.Component />);
                break;
        }
        return (
            <div>
                <Nav.NavigationBar active={this.state.pageId} onPage={this.onPageSelected.bind(this)}/>
                <div style={{marginTop:"70px"}}>
                    {pageComponent}
                </div>
            </div>
        );
    }

    public onPageSelected(pageId : Nav.PageId) {
        this.state.pageId = pageId;
        this.forceUpdate();
    }
}

ReactDOM.render(
    <div>
        <IndexPage />
    </div>,
    document.getElementById("react-root")
);
