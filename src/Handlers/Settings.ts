/**
 * @file Settings.ts
 * @description This file contains the Settings class which handles getting and setting user settings.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Communicator from "./Communicator.ts";
import { AxiosResponse } from "axios";
import { SettingsSessionError } from "../Handlers/Errors/SessionError.ts";
import AuthorizationError from "../Authorization/Errors/AuthorizationError.ts";

export interface ClientSettings {
    // Settings common to all clients for a particular customer
    aiName: string;
    aiProfileImage: string;
    fullLogo: string;
    compactLogo: string;
    isProfileImageRequired: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SettingsObject {
    client_settings?: any; // Settings common to all clients for a particular customer
    user_settings?: any;  // Settings specific to a user
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const defaultClientSettings: ClientSettings = {
    aiName: "AI",
    aiProfileImage: "",
    fullLogo: "",
    compactLogo: "",
    isProfileImageRequired: false
};

const defaultUserSettings: any = {}; // eslint-disable-line

export const defaultSettings: SettingsObject = {
    client_settings: defaultClientSettings,
    user_settings: defaultUserSettings
};

/**
 * @class Settings
 * @description Handles getting and setting user settings by communicating with the backend API.
 * @property {Communicator} _communicator - An instance of the Communicator class used to send requests.
 */
class Settings {
    private _communicator!: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

    /**
     * @method getSettings
     * @description Gets the user settings from the backend API.
     * @returns {SettingsObject} - The user settings.
     * @throws {SettingsSessionError} - Throws an error if the request fails.
     */
    public getSettings(): SettingsObject {
        const url: string = "/api/settings";
        let response: AxiosResponse<any,any> | undefined; // eslint-disable-line
        this._communicator.getRequest(url, {}).then((res) => {
            response = res;
        }).catch((error) => {
            console.error("Error getting history: ", error);
            throw error;
        });
        let client_settings: ClientSettings = defaultClientSettings;
        let user_settings: any; // eslint-disable-line
        if (response) {
            if (response.status >= 200 && response.status < 300) {
                if (response.data && response.data['client_settings']) {
                    client_settings = response.data['client_settings'];
                }
                if (response.data && response.data['user_settings']) { // there are no  user settings defined yet
                    user_settings = response.data['user_settings'];
                }
            }
            if (response.status === 403) {
                throw new AuthorizationError("Error getting settings: Unauthorized");
            }
            return {client_settings: client_settings, user_settings: user_settings} as SettingsObject;
        }
        throw new SettingsSessionError("Error getting settings");
    }

    [Symbol.dispose](): void {
    }
}

export default Settings;