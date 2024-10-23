import Button from "@mui/material/Button";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const LogoutComponent = () => {
    return (
        <div className="logout-group">
            <div role="button" onClick={(e) => { handleExpand(); }}><img src="./assets/expand.svg" alt="expand-logout" className="expand-icon" /></div>
            <div className="logout-modal">
                <Button component={RouterLink} to="/logout" variant="contained" color="primary">Logout</Button>
            </div>
        </div>
    )
}

const handleExpand = () => {
    const modal = document.querySelector(".logout-modal") as HTMLElement;
    if (modal.style.display === "none" || modal.style.display === "") {
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
}

export default LogoutComponent;