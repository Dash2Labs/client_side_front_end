import React from "react";
import { Typography } from "@mui/material";

export const ErrorComponent = ({ error }: { error: any }) => {
    return <Typography variant="h6">An Error Occurred: {error.errorCode}</Typography>;
}