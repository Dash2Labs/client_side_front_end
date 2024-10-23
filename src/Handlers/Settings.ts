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

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SettingsObject {
    client_settings?: any; // Settings common to all clients for a particular customer
    user_settings?: any;  // Settings specific to a user
};
/* eslint-enable @typescript-eslint/no-explicit-any */

class Settings {
    private _communicator!: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

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
            return {client_settings: client_settings, user_settings: user_settings} as SettingsObject;
        }
        throw new SettingsSessionError("Error getting settings");
    }

    public setSettings(settings: SettingsObject): void {
        const url: string = "/api/settings";
        let response: any; // eslint-disable-line
        this._communicator.postRequest(settings, url, {}).then((res) => {
            response = res;
        }).catch((error) => {
            console.error("Error setting settings: ", error);
            throw error;
        });
    }

    [Symbol.dispose](): void {
    }
}

export default Settings;