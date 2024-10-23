import React from "react";
import "../stylesheets/spinner.css";

type SpinnerProps = {
    display: string;
};
const Spinner = (props: SpinnerProps) => (
    <div className="spinner" style={{ display: props.display }}>
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
    </div>
);

export default Spinner;