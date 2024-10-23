import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import CHATBOX from './chatbox';
import Home from './Home';
import Logout from './Logout';
import suggestions from '../models/defaultsuggestions';
import { MsalProvider } from '@azure/msal-react';
import Grid from '@mui/material/Grid';
import { CustomNavigationClient } from '../controllers/auth/NavigationClient';
import { PublicClientApplication } from '@azure/msal-browser';

const App = ({ pca }: { pca: PublicClientApplication }) => {
    const navigate = useNavigate();
    const navigationClient = new CustomNavigationClient(navigate);
    pca.setNavigationClient(navigationClient);

    return (
        <MsalProvider instance={pca}>
            <Grid>
                <Pages />
            </Grid>
        </MsalProvider>);
}

const Pages = () => {
    return (
        <Routes>
            <Route path="/chat" element={<CHATBOX greeting={{ suggestions, botIcon: "./assets/chatIcon.png"}} logo= {'./assets/NM_IT'}
                profileIcon={"./assets/profile.png"} />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/" element={<Home />} />
        </Routes>
    );
}
export default App;