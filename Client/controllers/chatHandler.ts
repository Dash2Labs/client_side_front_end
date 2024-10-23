import { Dispatch, SetStateAction } from "react";
import xss from "xss"; // Library for sanitizing input to prevent XSS attacks
import { getMyId } from "./auth/msgraphapi"; // Function for fetching the user's ID
import React, { useState } from 'react';

/**
 * Handles a user's query by sanitizing the input, sending it to an API endpoint,
 * and returning the response and response time.
 * @needs check if the cleansing hoistry will be needed in history handler
 * @param {string} question - The user's question.
 * @param {string} userId - The user's unique ID.
 * @param {string} [history] - Optional conversation history.
 * @param {string} sessionId - The current session ID.
 * @returns {Promise<{ question: string; answer: string; responseTime: number }>} 
 * - An object containing the sanitized question, the chatbot's response, and the time taken to respond.
 */
export const handleUserQuery = 
    async (
        question: string,
        userId: string,
        history: string | undefined,
        sessionId: string,
    ): Promise<{ question: string; answer: string; responseTime: number }> => { 

        const startTime = Date.now(); // Record the start time for calculating response time
        const cleanQuestion = xss(question); // Sanitize the user's question to prevent XSS attacks

        // Use default history text if none is provided
        if (!history) {
            history = "no history";
        }

        // Prepare the request payload
        const requestBody = JSON.stringify({ question: cleanQuestion, history });

        // Create the request to send to the API
        const request: Request = new Request(`/api/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userId': userId,
                'sessionId': sessionId,
            },
            body: requestBody,
        });

        try {
            const res = await fetch(request); // Make the request to the server
            const val = await res.json(); // Parse the response
            const endTime = Date.now(); // Record the end time for calculating response time
            const responseTime = endTime - startTime; // Calculate total response time

            // Return the sanitized question, response, and response time as an object
            return {
                question: cleanQuestion,
                answer: val.answer.text,
                responseTime,
            };
        } catch (err) {
            alert("Sorry, something went wrong"); // Alert user on error
            console.error("Error: " + err); // Log the error for debugging

            // Return default values in case of an error
            return {
                question: cleanQuestion,
                answer: "",
                responseTime: 0,
            };
        }
    };

/**
 * Creates HTML markup from conversation history while sanitizing the content.
 * 
 * @param {string} history - The conversation history in HTML format.
 * @returns {{ __html: string }} - An object suitable for rendering sanitized HTML in React components.
 */
export const createMarkup = (history: string) => {
    // Clean the string to avoid potential XSS attacks from altered local storage data
    const options = {
        whiteList: {
            div: ["class"],
            img: ["src"],
            p: [],
            b: []
        }
    };
    const clean = xss(history, options); // Sanitize HTML based on allowed tags and attributes
    return { __html: clean };
};

/**
 * Checks if the provided text is null, undefined, or empty.
 * 
 * @param {string} text - The text to be validated.
 * @returns {boolean} - Returns true if the text is null, undefined, or an empty string.
 */
const unexpected = (text: string): boolean => {
    return text === null || text === undefined && text === "";
};

// Exported chatHandler object that exposes the main functions for handling chat interactions
const chatHandler = {
    handleUserQuery,
    createMarkup
};

export default chatHandler;

// Deprecated Code Below (Can Be Removed or Kept for Reference)
/*
export const handleUserQuery =
    async (question: string,
        threadId: string,
        history: string,
        setHistory: Dispatch<SetStateAction<string>>,
        profileIcon: string,
        botIcon: string,
        setThreadId: Dispatch<SetStateAction<string>>,
        onResponseReceived: (question: string, response: string, responseTime: number) => void, 
        setFeedbackSubmitted: Dispatch<SetStateAction<boolean>>,
        setShowSpinner: Dispatch<SetStateAction<string>>) => {

        // Ensure threadId is not null, undefined, or empty
        if (threadId === null || threadId === undefined || threadId === "") {
            threadId = "null-id";
        }

        const startTime = Date.now(); // Record the start time for calculating response time
        const cleanQuestion = xss(question); // Sanitize the user's question to prevent XSS attacks
        const requestBody = JSON.stringify({ 'threadId': threadId, 'userId': await getMyId(), question: cleanQuestion });
        console.log("Request body: ", requestBody);

        // Prepare the request to send to the API
        let request: Request = new Request(`/api/ask`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' 
            },
            body: requestBody
        });

        // Fetch response from the API and handle the conversation update
        let historyHtml = await fetch(request)
            .then(async res => {
                return await res.json()
                    .then(async (val) => {
                        setThreadId(val.id); // Update threadId based on response
                        const endTime = Date.now(); 
                        const responseTime = endTime - startTime; 
                        onResponseReceived(question, val.answer.text, responseTime); // Callback for received response

                        // Set updated history and return HTML representation
                        return await setHistoryWithFiles(val.answer.text, history, botIcon, profileIcon, cleanQuestion)
                            .then((historyHtml) => (historyHtml))
                            .catch(err => { throw err; });
                    })
                    .catch(err => { throw err; });
            })
            .catch(err => {
                alert("Sorry, something went wrong"); // Alert user on error
                console.error("Error: " + err);
                return "";
            });

        setShowSpinner('none'); // Hide spinner after processing
        setHistory(historyHtml); // Update conversation history
        setFeedbackSubmitted(false); // Reset feedback state
    };
*/
