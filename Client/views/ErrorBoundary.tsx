import React from "react";

export class ErrorBoundary extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    state = {
        hasError: false,
        error: null
    };

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return (this.props as { children: React.ReactNode }).children; // Add type assertion to fix the type error
    }
}
