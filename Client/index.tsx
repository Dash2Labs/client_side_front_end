import App from './views/app';
import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';

import { EventType, PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { msalConfig } from './controllers/auth/authConfig';

export const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
    // If a user is already logged in, set the active account
    if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }
    msalInstance.enableAccountStorageEvents();
    msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const account = event.payload;
            msalInstance.setActiveAccount(account as AccountInfo);
        }
    });
    const rootElement = document.getElementById("root");
    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(<BrowserRouter><App pca={msalInstance} /></BrowserRouter>);
    }
});