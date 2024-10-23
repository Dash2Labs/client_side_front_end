import React, { useState, useEffect } from 'react';
import chatHandler from './chatHandler';
import historyHandler from './historyHandler';
import feedbackHandler from './feedbackHandler';

/**
 * SessionHandler Component:
 * This component manages user sessions, handles chat interactions, retrieves past conversations,
 * and manages feedback submission. It includes functionalities for:
 * @needs edge case handling
 * @needs limitations for example make sure feedback/queries are valid
 * @needs to make sure when user refreshes page we can store the most recent values in recent memory so it does not wipe the session
 * - Initializing user sessions
 * - Handling user queries
 * - Managing session history
 * - Submitting feedback
 * -managing feedback
 * - switching between past conversations
 * - Fetching past conversation history // should we load the history here of the 5 most recent convos before hand or only when the user requests it?
 */

const SessionHandler: React.FC = () => {
    // User information and session management
    const [userId, setUserId] = useState<string>(''); // Holds the current user's ID
    const [sessionId, setSessionId] = useState<string>(''); // Tracks the current session's unique ID

    // Chat and conversation state
    const [history, setHistory] = useState<string>(''); // Stores the ongoing conversation history
    const [pastConversations, setPastConversations] = useState<string[] | null>(null); // Holds past conversation links, null if not yet fetched
    const [userQuery, setUserQuery] = useState<string>(''); // Tracks user's current query input
    const [response, setResponse] = useState<string>(''); // Stores the last response received from the chatbot

    // Feedback state
    const [feedbackText, setFeedbackText] = useState<string>(''); // Stores feedback text given by the user
    const [feedbackId, setFeedbackNum] = useState<string>(''); // Tracks the emoji feedback ID given by the user
    const [feedbackSet, setFeedbackSet] = useState<boolean>(false); // Indicates whether feedback has been submitted

    // Utility state
    const [responseTime, setResponseTime] = useState<number>(0); // Tracks the response time of the chatbot
    const [isLoading, setIsLoading] = useState<boolean>(false); // Indicates if a response is being fetched
    const [currentTime, setCurrentTime] = useState<string>(''); // Stores the current time

    // Initialize session or fetch user ID on component mount
    useEffect(() => {
        const initSession = async () => {
            try {
                const fetchedUserId = await fetchUserId(); // Fetches or generates a user ID
                setUserId(fetchedUserId);
                const newSessionId = generateSessionId(); // Generates a new session ID
                setSessionId(newSessionId);
            } catch (error) {
                console.error('Error initializing session:', error); // Logs an error if session initialization fails
            }
        };
        initSession();
    }, []);

    /**
     * Saves the current conversation history to the server
     */
    const saveHistory = async () => {
        try {
            const status = await historyHandler.saveHistory(userId, sessionId, history);
        } catch (error) {
            console.error(error); // Logs an error if history saving fails
        }
    };

    /**
     * Handles the submission of a user query:
     * - Sends the query to the chatHandler
     * - Updates the chat response and appends to the conversation history
     */
    const handleSubmitQuery = async () => {
        if (!userQuery) return; // Prevents submission if the query input is empty

        setIsLoading(true); // Starts loading state for query processing
        try {
            const result = await chatHandler.handleUserQuery(userQuery, userId, history, sessionId); // Sends the query to the chatbot handler
            
            // Updates state based on the response from the chatHandler
            setResponse(result.answer);
            setResponseTime(result.responseTime);
            setHistory(prevHistory => `${prevHistory}\nUser: ${result.question}\nBot: ${result.answer}`); // Appends the new conversation to history
        } catch (error) {
            console.error("Failed to fetch response:", error); // Logs an error if query handling fails
        } finally {
            setIsLoading(false); // Ends loading state
            setUserQuery(''); // Resets the input query
        }
    };

    /**
     * Checks if feedback is valid for submission.
     * @returns True if either feedback text or emoji feedback is provided.
     */
    const isValidFeedback = () => {
        return feedbackText.length > 0 || feedbackId !== ''; // Ensures feedback is not empty
    };

    /**
     * Submits feedback for the current conversation:
     * - Prevents multiple submissions
     * - Sends feedback to feedbackHandler
     */
    const handleFeedbackSubmission = async () => {
        if (!feedbackSet && isValidFeedback()) {
            setFeedbackSet(true); // Prevents re-submission
            const currentTime = new Date().toISOString(); // Records the current time for feedback submission
            try {
                const status = await feedbackHandler.submitFeedback(userId, sessionId, currentTime, feedbackText, feedbackId, userQuery, response, responseTime);
                setFeedbackNum(''); // Resets feedback ID
                setFeedbackText(''); // Resets feedback text
                console.log("Received code " + String(status)); // Logs the status code of feedback submission
            } catch (error) {
                console.error('Error saving feedback:', error); // Logs an error if feedback submission fails
                setFeedbackSet(false); // Resets feedback state on failure
            }
        }
    };

    /**
     * Fetches or generates a user ID:
     * @returns A promise that resolves to a user ID string.
     */
    const fetchUserId = async (): Promise<string> => {
        // Your logic to fetch user ID
        return 'example-user-id'; // Replace with real implementation
    };

    /**
     * Generates a new session ID:
     * - Uses current date and a random string for uniqueness
     * @returns A unique session ID string.
     */
    const generateSessionId = (): string => {
        const dateStr = Date.now().toString(36); // Converts current date to a base-36 string
        const randomStr = Math.random().toString(36).substring(2, 8); // Generates a random base-36 string
        return `${dateStr}-${randomStr}`; // Combines date and random strings for a session ID
    };

    /**
     * Retrieves the user's past conversations if not already fetched.
     */
    const getPastConversations = async () => {
        if (!pastConversations) { // Checks if past conversations have not been fetched
            const hist = await historyHandler.getUsersPastConversations(userId); // Fetches past conversations
            setPastConversations(hist); // Updates state with the fetched conversation history
        }
    };

    return (
        // Component's JSX rendering (omitted for brevity)
    );
};

export default SessionHandler;
