/**
 * @file Config.ts
 * @description 
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { LogLevel, Configuration } from "@azure/msal-browser";
import { constants } from "../constants.js";

// Browser check variables
// If you support IE, our recommendation is that you sign-in using Redirect APIs
// If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
const ua: string = window.navigator.userAgent;
const msie: number = ua.indexOf("MSIE ");
const msie11: number = ua.indexOf("Trident/");
const msedge: number = ua.indexOf("Edge/");
const firefox: number = ua.indexOf("Firefox");
const isIE: boolean = msie > 0 || msie11 > 0;
const isEdge: boolean = msedge > 0;
const isFirefox: boolean = firefox > 0; // Only needed if you need to support the redirect flow in Firefox incognito


// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
    auth: {
        clientId: constants.app_id,
        authority: constants.app_authority,
        redirectUri: constants.redirect_uri,
        postLogoutRedirectUri: "/",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: isIE || isEdge || isFirefox,
    },
    system: {
        iframeHashTimeout: 100000,
        allowNativeBroker: false, // Disables WAM Broker
        /* eslint-disable @typescript-eslint/no-explicit-any */
            loggerOptions: {
                loggerCallback: (level: any, message: any, containsPii: any) => { 
        /* eslint-enable @typescript-eslint/no-explicit-any */
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        return;
                    case LogLevel.Info:
                        return;
                    case LogLevel.Verbose:
                        return;
                    case LogLevel.Warning:
                        return;
                    default:
                        return;
                }
            },
        },
    },
};
// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
    scopes: ["User.Read"]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphProfilePhotoEndpoint: "https://graph.microsoft.com/v1.0/me/photo/$value"
};