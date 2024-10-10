/**
 * @file Feedback.ts
 * @description This file contains the Feedback class which handles user feedback communications to the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Communicator from "./Communicator.ts"

// Interface defining the structure of a feedback object
export interface FeedbackObject {
  feedback: string; // The text of the feedback provided by the user
  feedbackId: string; // ID representing the type of feedback (e.g., emoji feedback)
  question: string; // The user's query/question that was answered
  response: string; // The bot's response to the user's query
  responseTime: number; // Time taken by the bot to generate the response (in milliseconds)
}

class Feedback {
    private _communicator: Communicator;

    constructor (communicator: Communicator) {
        this._communicator = communicator;
    }

    public sendFeedback(feedback: FeedbackObject): boolean{
        const response = this._communicator.sendFeedback(feedback); // TODO: Do we need to verify we have cleaned data here?
        return response.status === 200;
    }

    [Symbol.dispose](): void {
    }
}

export default Feedback;