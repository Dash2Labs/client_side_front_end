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

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SettingsObject {
    client_settings?: any; // Settings common to all clients for a particular customer
    user_settings?: any;  // Settings specific to a user
};
/* eslint-enable @typescript-eslint/no-explicit-any */

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
        let client_settings: any; // eslint-disable-line
        let user_settings: any; // eslint-disable-line
        if (response) {
            client_settings = response.data['client_settings'];
            if (response.status === 206) {
                user_settings = response.data['user_settings'];
            }
            if (response.status === 403) {
                throw new AuthorizationError("Error getting settings: Unauthorized");
            }
            return {client_settings: client_settings, user_settings: user_settings} as SettingsObject;
        }
        throw new SettingsSessionError("Error getting settings");
    }

    /**
     * @method setSettings
     * @description Sets the user settings in the backend API.
     * @param {SettingsObject} settings - The user settings to be set.
     * @throws {SettingsSessionError} - Throws an error if the request fails.
     */
    public setSettings(settings: SettingsObject): void {
        const url: string = "/api/settings";
        let response: any; // eslint-disable-line
        this._communicator.postRequest(settings, url, {}).then((res) => {
            response = res;
        }).catch((error) => {
            console.error("Error setting settings: ", error);
            if (error.response.status === 403) {
                throw new AuthorizationError("Error setting settings: Unauthorized");
            }
            throw error;
        });
    }

    [Symbol.dispose](): void {
    }
}

export default Settings;