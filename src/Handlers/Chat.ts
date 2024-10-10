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

export interface ChatObject {
    question: string;
};

class Chat {
    private _communicator: Communicator;

    constructor(communicator: Communicator) {
        this._communicator = communicator;
    }

    public sendQuestion(question: ChatObject): Message{
        const response = this._communicator.sendChat(question); // TODO: Do we need to verify we have cleaned data here?
        return response.data as Message;
    }
}

export default Chat;