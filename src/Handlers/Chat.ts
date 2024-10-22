/**
 * @file Chat.ts
 * @description This file contains the Chat class which handles questions and responses to the client server
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Communicator from './Communicator.ts';
import { Message } from '../Models/Message.js';
import { ChatSessionError } from './Errors/SessionError.ts';

export interface ChatObject {
    question: string;
};

class Chat {
    private _communicator: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

    public sendQuestion(question: ChatObject): Message {
        const url: string = "/api/chat"; // TODO: Do we need to verify we have cleaned data here?
        let response: any;
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