import { createRoot } from 'react-dom/client';
import App from './app.tsx';
import { constants } from './constants.js';
import { EventType, AccountInfo } from '@azure/msal-browser';
import { msalInstance } from './Authorization/MsalInstance.ts';
import React from 'react'; // eslint-disable-line

if (constants.useauth === true) {
  msalInstance.initialize().then(() => {
    // If a user is already logged in, set the active account
    if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    };
    msalInstance.enableAccountStorageEvents();
    msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const account = event.payload;
            msalInstance.setActiveAccount(account as AccountInfo);
        }
    });
});
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
} else {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
};
