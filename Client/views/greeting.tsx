import React from "react";
import { GreetingProps } from "../props";

const GREETING = (props: GreetingProps) => {
    const { botIcon, suggestions } = props;
    return (<div id="greeting">
        <img src={botIcon} />
        <h1>How can I help you today?</h1>
        <div id="suggestions">
            <div className="suggestion">
                <span className="suggestionsTitle">{suggestions.suggestion1Title}</span>
                <span className="suggestionsSubtitle">{suggestions.suggestion1Subtitle}</span>
            </div>
            <div className="suggestion">
                <span className="suggestionsTitle">{suggestions.suggestion2Title}</span>
                <span className="suggestionsSubtitle">{suggestions.suggestion2Subtitle}</span>
            </div>
            <div className="suggestion">
                <span className="suggestionsTitle">{suggestions.suggestion3Title}</span>
                <span className="suggestionsSubtitle">{suggestions.suggestion3Subtitle}</span>
            </div>
            <div className="suggestion">
                <span className="suggestionsTitle">{suggestions.suggestion4Title}</span>
                <span className="suggestionsSubtitle">{suggestions.suggestion4Subtitle}</span>
            </div>
        </div>
    </div>);
};

export default GREETING;