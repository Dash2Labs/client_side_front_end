/**
 * @file ChatHistory.ts
 * @description This file contains the History class which handles history of user sessions.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Communicator from "./Communicator.ts";
import { Message } from "../Models/Message.ts";

export interface ChatHistoryObject {
    chats: Message[];
};

/**
 * @class History
 * @description Handles history-related operations by communicating with the backend API.
 * @property {Communicator} _communicator - An instance of the Communicator class used to send requests.
 */
class ChatHistory {
    private _communicator!: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

    /**
     * @method getChatHistory
     * @description Gets the chat history of user session from the backend API.
     * @returns {HistoryObject} - The chat history of a user session.
     */
    public async getChatHistory(session_id: string, startId: string, length: number): Promise<ChatHistoryObject> {
        const start = parseInt(startId);
        if (isNaN(start)) {
            throw new Error("StartId must be a number");
        }
        const url: string = `/api/chats/${session_id}/?startId=${startId}&length=${length}`;
        let response: any; // eslint-disable-line
        this._communicator.getRequest(url, {}).then((res) => {
            response = res;
        }).catch((error) => {
            console.error("Error getting chats: ", error);
        });
        return {chats: response.data} as ChatHistoryObject;
    }

    [Symbol.dispose](): void {
    }
}

export default ChatHistory;