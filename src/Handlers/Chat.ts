/**
 * @file Chat.ts
 * @description This file contains the Chat class which handles questions and responses to the client server
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Communicator from './Communicator.ts';
import { Message } from '../Models/Message.ts';
import { ChatSessionError } from './Errors/SessionError.ts';

export interface ChatObject {
    message: string;
};

/**
 * @class Chat
 * @description Handles chat-related operations by communicating with the backend API.
 * @property {Communicator} _communicator - An instance of the Communicator class used to send requests.
 */
class Chat {
    private _communicator: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

    /** 
    * @method sendChat
    * @description Sends a chat question to the backend API and returns the response message.
    * @param {ChatObject} message - The chat question object to be sent.
    * @returns {Message} - The response message from the backend API.
    * @throws {ChatSessionError} - Throws an error if the request fails or the response status is not 200.
    */
    public async sendChat(message: ChatObject): Promise<Message> {
        const url: string = "/api/chat";
    
        let response = this._communicator.postRequest(message, url, {}).then((res) => {
            if (res && res.status === 200) {
                return res.data.message as Message;
            }else {
                throw new ChatSessionError("status " + (res !== undefined ? res.status : "missing response"));
            }
            }).catch((error) => {
                console.error("Error sending question: ", error);
                throw new ChatSessionError("Error sending question: " + error.message);
            });
        return response;
            
        }

    [Symbol.dispose](): void {
    }
}

export default Chat;