/**
 * @file Msgraph.ts
 * @description 
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { loginRequest, graphConfig } from "./Config.ts";
import { msalInstance } from "./MsalInstance.ts";

export async function callMsGraph(accessToken: string | null, getPhoto: boolean = false) {
    if (!accessToken) {
        const account = msalInstance.getActiveAccount();
        if (!account) {
            throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
        }

        const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: account
        });
        accessToken = response.accessToken;
    }

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    if (getPhoto) {
        return fetch(`${graphConfig.graphProfilePhotoEndpoint}`, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.blob();
            })
            .then(blob => {
                return URL.createObjectURL(blob);
            })
            .catch(error => null);
    }

    return fetch(graphConfig.graphMeEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export async function getProfile(accessToken: string | null) {
    return callMsGraph(accessToken, true);
}

export async function getMyId() {
    return msalInstance.getActiveAccount()?.homeAccountId;
}