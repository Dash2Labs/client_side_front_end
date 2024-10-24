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
    question: string;
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
    * @method sendQuestion
    * @description Sends a chat question to the backend API and returns the response message.
    * @param {ChatObject} question - The chat question object to be sent.
    * @returns {Message} - The response message from the backend API.
    * @throws {ChatSessionError} - Throws an error if the request fails or the response status is not 200.
    */
    public sendQuestion(question: ChatObject): Message {
        const url: string = "/api/chat"; // TODO: Do we need to verify we have cleaned data here?
        let response: any;  // eslint-disable-line
        this._communicator.postRequest(question, url, {}).then((res) => {
                response = res;
            }).catch((error) => {
                console.error("Error sending question: ", error);
                throw new ChatSessionError("Error sending question: " + error.message);
            });
            if (response.status === 200) {
                return response.data.message as Message;
            }else {
                throw new ChatSessionError("Error sending question: status " + response.status);
            }
        }

    [Symbol.dispose](): void {
    }
}

export default Chat;