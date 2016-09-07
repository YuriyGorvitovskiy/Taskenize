import './bootstrap';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Nav from './widget/navigation-bar-v2';
import {InboxPage} from './widget/inbox-page';
//import {ExecutionPage} from './widget/execution-page';
import * as ExecutionPage from './widget/execution-page-v2';
import * as CompletedPage from './widget/completed-page';
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
                pageComponent = (<ExecutionPage.Component onPageSelected={this.onPageSelected.bind(this)}/>);
                break;
            case Nav.PageId.COMPLETED:
                pageComponent = (<CompletedPage.Component />);
                break;
            case Nav.PageId.REPORT:
                pageComponent = (<ReportPage.Component />);
                break;
        }
        return pageComponent;
    }

    public onPageSelected(pageId : Nav.PageId) {
        this.setState({
            pageId
        });
    }
}

ReactDOM.render(<IndexPage />,
    document.getElementById("react-root")
);
