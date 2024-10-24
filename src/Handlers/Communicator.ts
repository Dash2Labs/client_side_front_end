/**
 * @file Communicator.ts
 * @description This file contains the class which communicates with the server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import axios, { AxiosRequestConfig, AxiosHeaders, AxiosResponse } from "axios";
import { FeedbackObject } from "./Feedback.ts";
import { HistoryObject } from "./History.ts";
import { ChatObject } from "./Chat.ts";
import { SettingsObject } from "./Settings.ts";

type RequestBody = FeedbackObject | HistoryObject | ChatObject | SettingsObject;

/**
 * @class Communicator
 * @description A class responsible for handling communication with the server.
 * @param session_id - The session ID for the current user session.
 * @param user_id - The user ID for the current user.
 */
class Communicator {
    private _maxRetries: number = 2;
    private _retryCount: number = 0;
    private _defaultHeaders: { [key: string]: string };
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

    /**
     * @description This function sends a request to the server
     * @param url
     * @param custom_headers
     * @returns a promise that resolves to the response from the server
     * @throws an error if the request fails
     */
    public async getRequest(url: string,
                            custom_headers: typeof AxiosHeaders | object): 
                            Promise<AxiosResponse<any, any>> // eslint-disable-line
    {
        // Send request to the server
        this._appendHeaders(custom_headers);
        while (this._retryCount <= this._maxRetries) {
                const response = await axios.get(url, this._config).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    if (response.status === 206) {
                        // Partial Success
                        console.error("getRequest: Partial Content Error sending request: ", response);
                    }
                    // Success
                    return response;
                }
            }).catch((error) => {
                if (this._retryCount >= this._maxRetries) {
                    console.error("getRequest: MaxRetries exceeded Error sending request: ", error);
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
        console.error("getRequest: MaxRetries exceeded Error sending request");
        throw new Error("MaxRetries exceeded Error sending request");
    }
    
    /**
     * @description This function sends a request to the server
     * @param url
     * @param custom_headers
     * @returns a promise that resolves to the response from the server
     * @throws an error if the request fails
     */
    public async postRequest(body: RequestBody,
                               url: string,
                               custom_headers: typeof AxiosHeaders | object): Promise<any> {  // eslint-disable-line
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
                        console.error("postRequest: MaxRetries exceeded Error sending request: ", error)
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
        console.error("postRequest: MaxRetries exceeded Error sending request");
        throw new Error("MaxRetries exceeded Error sending request");
    }

    /**
     * @description This function appends custom headers to the default headers
     * @param custom_headers
     * @private
     */
    private _appendHeaders(custom_headers: typeof AxiosHeaders | object): void {
        const headers = {
            ...this._defaultHeaders, ...custom_headers, 
        };
        this._config = { headers };
    }

    [Symbol.dispose](): void {
    }
}

export default Communicator;