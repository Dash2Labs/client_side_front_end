import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import "../stylesheets/home.css";
import { InteractionStatus } from "@azure/msal-browser";
import { callMsGraph } from "../controllers/auth/msgraphapi";
import { loginRequest } from "../controllers/auth/authConfig";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { constants } from "../constants.js";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#Ff0000"
        },
        secondary: {
            main: "#00008b"
        }
    }
});

const HomeIcons = () => (
    <div className="home">
        <img src={constants.home_image_1} alt="police" className="home-icon" id="police-icon"></img>
        <img src={constants.customer_logo} alt="Bobby" className="home-icon" id="bot-icon"></img>
        <img src={constants.home_image_2} alt="emt" className="home-icon" id="emt-icon"></img>
        <img src={constants.home_image_3} alt="firefighters" className="home-icon" id="firefighter-icon"></img>
    </div>
);

const Home = () => {
    const { instance, inProgress } = useMsal();
    const [graphData, setGraphData] = React.useState<any>(null);

    React.useEffect(() => {
        if (!graphData && inProgress === InteractionStatus.None) {
            callMsGraph(null)
                .then(response => setGraphData(response))
                .catch(error => {
                    if (error.name === "InteractionRequiredAuthError") {
                        instance.acquireTokenRedirect({
                            ...loginRequest,
                            account: instance.getActiveAccount() || undefined
                        });
                    };
                });
        }
    }, [graphData, inProgress, instance]);
    let salutation: string = "";
    if (graphData) {
        const { displayName, jobTitle } = graphData;
        salutation = `Welcome, ${jobTitle || ""} ${displayName}!`;
    }
    return (
        <div className="home-page">
            <ThemeProvider theme={theme}>
                <AuthenticatedTemplate>
                    <Typography variant="h4" className="home-greeting">{salutation}</Typography>
                    <ButtonGroup className="nav-links">
                        <Button component={RouterLink} to="/chat" variant="contained" color="secondary">Chat</Button>
                        <Button component={RouterLink} to="/logout" variant="contained" color="primary">Logout</Button>
                    </ButtonGroup>
                    <HomeIcons />
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <Typography variant="h4" className="home-greeting">{constants.product_title} and Dash2Labs welcomes you to chat!  Please login.</Typography>
                    <ButtonGroup className="nav-links">
                        <Button component={RouterLink} to="/chat" variant="contained" color="primary">Chat</Button>
                        <Button component={RouterLink} to="/login" variant="contained" color="secondary">Login</Button>
                    </ButtonGroup>
                    <HomeIcons />
                </UnauthenticatedTemplate>
            </ThemeProvider>
        </div>);
};

export default Home;