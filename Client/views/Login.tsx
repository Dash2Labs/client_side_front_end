import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../controllers/auth/authConfig";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

export const SignInButton = () => {
    const { instance } = useMsal();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
          instance.loginPopup({
            ...loginRequest,
            redirectUri: `${window.location.origin}/chat`
        }); 
    };

    return (
        <div>
            <Button
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                color="inherit"
            >Login</Button>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={open}
                onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={handleMenu}>Login</MenuItem>
            </Menu>
        </div>
    )
}

export default SignInButton;