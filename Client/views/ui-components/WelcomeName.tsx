import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import Typography from "@mui/material/Typography";

const WelcomeName = () => {
    const { instance } = useMsal();
    type Name = string | null;
    const [name, setName] = useState<Name>();

    const activeAccount = instance.getActiveAccount();
    useEffect(() => {
        if (activeAccount) {
            setName(activeAccount.name?.split(' ')[0]);
        } else {
            setName(null);
        }
    }, [activeAccount]);


    if (name) {
        return <Typography variant="h6" className="welcome">Welcome, {name}</Typography>;
    } else {
        return null;
    }
};

export default WelcomeName;