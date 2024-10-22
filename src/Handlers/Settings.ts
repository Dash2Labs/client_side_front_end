/**
 * @file Settings.ts
 * @description This file contains the Settings class which handles getting and setting user settings.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Communicator from "./Communicator.ts";

export interface SettingsObject {
    client_settings?: any; // Settings common to all clients for a particular customer
    user_settings?: any;  // Settings specific to a user
};

class Settings {
    private _communicator!: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

    public getSettings(): SettingsObject {
        const url: string = "/api/settings";
        let response: any;
        this._communicator.getRequest(url, {}).then((res) => {
            response = res;
        }).catch((error) => {
            console.error("Error getting history: ", error);
            throw error;
        });
        return {settings: response.data} as SettingsObject;
    }

    public setSettings(settings: SettingsObject): void {
        const url: string = "/api/settings";
        let response: any;
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