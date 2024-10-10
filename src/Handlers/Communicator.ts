/**
 * @file Communicator.ts
 * @description This file contains the class which communicates with the server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import axios, { AxiosRequestConfig, AxiosHeaders, AxiosResponse, Axios } from "axios";
import { FeedbackObject } from "./Feedback.ts";
import { HistoryObject } from "./History.ts";
import { ChatObject } from "./Chat.ts";

type RequestBody = FeedbackObject | HistoryObject | ChatObject;
class Communicator {
    private _maxRetries: number = 2;
    private _retryCount: number = 0;
    private _defaultHeaders: any;
    private _config!: AxiosRequestConfig;

    constructor(session_id: string, user_id: string) {
        this._defaultHeaders = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Upgrade-Insecure-Requests": "1",
            "dash2labs-user-id": user_id,
            "dash2labs-session-id": session_id
        };
    }
    // Communicator class implementation  
    public sendFeedback(feedback: FeedbackObject): any {
        const url: string = "/api/feedback";
        return this._postRequest(feedback, url, {}).then((response) => {
            return response;
        }).catch((error) => {
            console.error("Error sending feedback: ", error);
            throw error;
        });
    }

    public getHistory(): any {
        const url: string = "/api/history";
        return this._getRequest(url, {}).then((response) => {
            return response;
        }).catch((error) => {
            console.error("Error getting history: ", error);
            throw error;
        });
    }

    public sendChat(chat: ChatObject): any {
        const url: string = "/api/chat";
        return this._postRequest(chat, url, {}).then((response) => {
            return response;
        }).catch((error) => {
            console.error("Error sending chat: ", error);
            throw error;
        });
    }

    private async _getRequest(url: string, custom_headers: AxiosHeaders | {}): Promise<AxiosResponse<any, any>>
    {
        // Send request to the server
        this._appendHeaders(custom_headers);
        while (this._retryCount <= this._maxRetries) {
                const response = await axios.get(url, this._config).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    // Success
                    return response;
                }
            }).catch((error) => {
                if (this._retryCount >= this._maxRetries) {
                    console.error("_getRequest: MaxRetries exceeded Error sending request: ", error);
                    throw error;
                }
                if (error.response && error.response.status >= 500) {
                    // Retry request for server failures
                    this._retryCount++;
                } else {
                    console.error("Error sending request: ", error);
                    this._retryCount = this._maxRetries + 1;
                    throw error;
                }
            });
            if (response) {
                return response;
            }
        }
        console.error("_getRequest: MaxRetries exceeded Error sending request");
        throw new Error("MaxRetries exceeded Error sending request");
    }

    private async _postRequest(body: RequestBody,
                               url: string,
                               custom_headers: AxiosHeaders | {}): Promise<any> {
        // Send request to the server
        this._appendHeaders(custom_headers);
        while (this._retryCount <= this._maxRetries) {
            // Send request to the server
            const response = axios.post(url, body, this._config)
                .then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        // Success
                        return response;
                    }
                })
                .catch((error) => {
                    if (this._retryCount >= this._maxRetries) {
                        console.error("_postRequest: MaxRetries exceeded Error sending request: ", error)
                        throw error;
                    }
                    if (error.response.status >= 500) {
                        // Retry request
                        this._retryCount++;
                    }
                    else {
                        console.error("Error sending request: ", error);
                        this._retryCount = this._maxRetries + 1;
                    }
                });
            if (response) {
                return response;
            }
        }
        console.error("_postRequest: MaxRetries exceeded Error sending request");
        throw new Error("MaxRetries exceeded Error sending request");
    }

    private _appendHeaders(custom_headers: AxiosHeaders | {}): void {
        const headers = {
            ...this._defaultHeaders, ...custom_headers, 
        };
        this._config = { headers };
    }
}

export default Communicator;