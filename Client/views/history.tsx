import React from 'react';
import { createMarkup } from '../controllers/chatHandler';

type HistoryProps = {
    history: string;
};

const HistoryComponent = (props: HistoryProps) => {
    return (
        <>
            <button id="clearHistory" onClick={() => {
                localStorage.setItem("history", "");
                localStorage.setItem("threadId", "");
                localStorage.setItem("lastUsed", "");
                window.location.reload();
            }}>Clear History</button>
            <div id="history" dangerouslySetInnerHTML={createMarkup(props.history)} ></ div>
        </>
    );
};

export default HistoryComponent;