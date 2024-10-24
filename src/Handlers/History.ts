/**
 * @file History.ts
 * @description This file contains the History class which handles history of user sessions.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Communicator from "./Communicator.ts";
import { Message } from "../Models/Message.ts";

export interface HistoryObject {
    history: Message[];
};

/**
 * @class History
 * @description Handles history-related operations by communicating with the backend API.
 * @property {Communicator} _communicator - An instance of the Communicator class used to send requests.
 */
class History {
    private _communicator!: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

    /**
     * @method getHistory
     * @description Gets the history of user sessions from the backend API.
     * @returns {HistoryObject} - The history of user sessions.
     */
    public getHistory(): HistoryObject {
        const url: string = "/api/history";
        let response: any; // eslint-disable-line
        this._communicator.getRequest(url, {}).then((res) => {
            response = res;
        }).catch((error) => {
            console.error("Error getting history: ", error);
            throw error;
        });
        return {history: response.data} as HistoryObject;
    }

    [Symbol.dispose](): void {
    }
}

export default History;