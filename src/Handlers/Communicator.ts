/**
 * @file Communicator.ts
 * @description This file contains the class which communicates with the server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import axios, { AxiosRequestConfig, AxiosHeaders } from "axios";
import { FeedbackObject } from "./Feedback.ts";

type RequestBody = FeedbackObject | HistoryObject | ChatObject;
class Communicator {
    private _maxRetries: number = 2;
    private _retryCount: number = 0;
    private _defaultHeaders: any;
    private _config!: AxiosRequestConfig;

    constructor() {
        this._defaultHeaders = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
    }
    // Communicator class implementation  
    public sendFeedback(feedback: FeedbackObject, session_id: string, user_id: string): void {
        const url: string = "/api/feedback";
        let custom_headers = session_id && user_id ? { "session_id": session_id, "user_id": user_id } : {};
        this._sendRequest(feedback, url, custom_headers);
    }

    public sendHistory(history: HistoryObject, session_id: string, user_id: string): void {
        const url: string = "/api/history";
        let custom_headers = session_id && user_id ? { "session_id": session_id, "user_id": user_id } : {};
        this._sendRequest(history, url, custom_headers);
    }

    public sendChat(chat: ChatObject, session_id: string, user_id: string): void {
        // Send chat to the server
        const url: string = "/api/chat";
        let custom_headers = session_id && user_id ? { "session_id": session_id, "user_id": user_id } : {};
    }

    private async _sendRequest(body: RequestBody,
                               url: string,
                               custom_headers: AxiosHeaders | {}): Promise<any> {
        // Send request to the server
        this._appendHeaders(custom_headers);
        while (this._retryCount <= this._maxRetries) {
            // Send request to the server
            return await axios.post(url, body)
                .then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        // Success
                        return response;
                    }
                })
                .catch((error) => {
                    if (error.response.status >= 500) {
                        // Retry request
                        this._retryCount++;
                    }
                    else {
                        console.error("Error sending request: ", error);
                        this._retryCount = this._maxRetries + 1;
                    }
                });
        }
    }

    private _appendHeaders(custom_headers: AxiosHeaders | {}): void {
        const headers = {
            ...this._defaultHeaders, ...custom_headers, 
        };
        this._config = { headers };
    }
}

export default Communicator;