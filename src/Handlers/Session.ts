/**
 * @file Session.ts
 * @description This file contains the Session class which handles user sessions.
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import { v4 as uuidv4 } from 'uuid';
import { ChatCardProps } from 'chatbot-ai-lib';
import Chat, { ChatObject } from './Chat.ts';
import Feedback from './Feedback.ts';
import { FeedbackObject } from '../Models/Feedback.ts';
import ChatHistory from './ChatHistory.ts';
import Settings, { SettingsObject, defaultSettings } from './Settings.ts';
import User from '../Models/User.ts';
import { constants } from '../constants.js';
import AuthorizationError from '../Authorization/Errors/AuthorizationError.ts';
import SessionError, { ChatSessionError, SettingsSessionError }  from './Errors/SessionError.ts';
import Communicator from './Communicator.ts';
import { getSizeInBytes } from '../Utilities/Utility.ts';
import SessionManager from './SessionManager.ts';
import xss from 'xss';

/**
 * @class Session
 * @description Handles user sessions by providing access to chat, feedback, history, and settings operations.
 * This class is the interface between the user interface and the backend API.
 * @property {Chat} _chat - An instance of the Chat class used to handle chat operations.
 * @property {Feedback} _feedback - An instance of the Feedback class used to handle feedback operations.
 * @property {ChatHistory} _chat_history - An instance of the History class used to handle history operations.
 * @property {Settings} _settings - An instance of the Settings class used to handle settings operations.
 * @property {User} _user - An instance of the User class used to handle user authentication.
 * @property {Communicator} _communicator - An instance of the Communicator class used to send requests.
 * @property {Date} createdAt - The date and time the session was created.
 * @property {Date} expiresAt - The date and time the session will expire.
 * @property {string} session_id - The unique identifier for the session.
 */
export default class Session {
    private _chat!: Chat; // this is the chat handler is resposible for sending and receiving chat messages
    private _feedback!: Feedback;  // this is the feedback handler is resposible for sending and receiving feedback
    private _chat_history!: ChatHistory; // this is the history handler is resposible for getting the history
    private _settings!: Settings; // this is the settings handler is resposible for getting and setting the settings
    private _user!: User; // this is the user object that is used to authenticate the user
    private _communicator!: Communicator; // this is the communicator object that is used to send and receive messages from the server
    public createdAt!: Date; // this is the date the session was created
    public expiresAt!: Date; // this is the date the session will expire
    public session_id!: string; // this is the session id that is used to identify the session
    public manager!: SessionManager; // this is the session manager that is used to manage the active sessions
    public settings: SettingsObject = defaultSettings; // this is the settings object that is used to store the user settings

    /**
    * @description This is the constructor for the Session class
    * @param {string?} session_id
    * @calls _initialize to initialize the session
    */
    constructor(manager: SessionManager, session_id?: string) {
        this.manager = manager;
        if (session_id) {
            manager.validActiveSession(session_id)
                .then((valid) => {
                    if (!valid) {
                        try {
                            this._initialize(session_id);
                            this.createdAt = new Date();
                            this.expiresAt = new Date(this.createdAt.getTime() + constants.expirationTime);
                        }
                        catch (error) {
                            if (constants.debug) {
                                console.error(error);
                            }
                            else {
                                if (error instanceof AuthorizationError) {
                                    throw error;
                                }
                                if (error instanceof Error) {
                                    throw new SessionError("Session initialization failed: " + error.message + " " + error.stack);
                                } else {
                                    throw new SessionError("Session initialization failed: Unknown error" + error);
                                }
                            }
                        }
                    }
                    else {
                        return manager.activeSessions[session_id];
                    }
                })
                .catch((error) => {
                    if (constants.debug) {
                        console.error(error);
                    }
                    else {
                        if (error instanceof AuthorizationError) {
                            throw error;
                        }
                        if (error instanceof Error) {
                            throw new SessionError("Session initialization failed: " + error.message + " " + error.stack);
                        } else {
                            throw new SessionError("Session initialization failed: Unknown error" + error);
                        }
                    }
                });
        }  
    }

    /**
     * @method sendChat
     * @description This is a callback function for the ui to send a chat message
     * @param {ChatObject} question
     * @throws {ChatSessionError} if the question is invalid
     * @returns {Message} the response message from the server
     */
    public async sendChat(question: ChatObject): Promise<ChatCardProps> {
        if (question.message.length === 0 || getSizeInBytes(question) > constants.maxLength) {
            throw new ChatSessionError("Invalid Question Length");
        }
        question.message = xss(question.message);
        return this._chat.sendChat(question).then((chat) => {
            return {
                // user details
                aiName: this._aiName,
                aiProfileImage: this._aiProfile_image,
                isProfileImageRequired: constants.requireProfileImage,
                userName: this._user.user_id as string,
                userProfileImage: this._user.photo as string,

                //Basic details
                chatId: chat.chat_id,
                feedback: chat.feedback,
                onStarClick: this.handleStarClick,
                onTextFeedbackSubmit: this.handleTextFeedbackSubmit,
                rating: chat.rating,
                ratingEnabled: constants.ratingsEnabled,
                sender: chat.sender,
                sessionId: chat.session_id,
                text: chat.message,
                textFeedbackEnabled: constants.textFeedbackEnabled,
                timestamp: chat.timestamp,
                type: chat.type,
            } as ChatCardProps;
        }).catch((error) => {
            console.error("Error sending chat: ", error);
            throw new ChatSessionError("Error sending chat: " + error.message);
        });
    }

    /**
     * @method sendFeedback
     * @description This is a callback function for the ui to send feedback
     * @param {FeedbackObject} feedback
     * @returns {boolean} indicating success or failure of the operation
     */
    public sendFeedback(fb: FeedbackObject): boolean {
        if (getSizeInBytes(fb) > constants.maxLength) {
            console.error("Feedback too long"); // won't throw for feedback error
        }

        fb.feedback = fb.feedback ? xss(fb.feedback) : undefined;
        fb.chatId = xss(fb.chatId);

        try {
            return this._feedback.sendFeedback(fb);
        } catch (error) {
            console.error("Error sending feedback: ", error);
            return false;
        }
    }

    public async fetchPreviousChats(startId: string): Promise<ChatCardProps[]> {
        return this.getChatHistory(startId, constants.historyLength)
            .then((chats) => {
                return chats;
            }).catch((error) => { 
                console.error("Error fetching previous chats: ", error);
                return [];
            });          
    }

    public async fetchLatestChats(): Promise<ChatCardProps[]> {
        return this.getChatHistory("0", constants.historyLength)
            .then((chats) => {  
                return chats;
            }
        ).catch((error) => {
            console.error("Error fetching latest chats: ", error);
            return [];
        });
    }

    /**
     * @method getHistory
     * @description This is a callback function for the ui to get the history
     * @returns {ChatCardProps} the history of user sessions
     */
    public async getChatHistory(startId: string, length: number): Promise<ChatCardProps[]> {
        return this._chat_history.getChatHistory(this.session_id, startId, length)
            .then((chats) => {
                const chat_history = chats.chats.map((chat) => {
                    return {
                        // user details
                        aiName: this.settings.client_settings.aiName,
                        aiProfileImage: this.settings.client_settings.aiProfileImage,
                        isProfileImageRequired: constants.requireProfileImage,
                        userName: this._user.userName as string,
                        userProfileImage: this._user.photo as string,

                        //Basic details
                        chatId: chat.chat_id,
                        feedback: chat.feedback,
                        onStarClick: this.handleStarClick,
                        onTextFeedbackSubmit: this.handleTextFeedbackSubmit,
                        rating: chat.rating,
                        ratingEnabled: constants.ratingsEnabled,
                        sender: chat.sender,
                        sessionId: chat.session_id,
                        text: chat.message,
                        textFeedbackEnabled: constants.textFeedbackEnabled,
                        timestamp: chat.timestamp,
                        type: chat.type,
                    } as ChatCardProps;
            });
            return chat_history;
        }).catch((error) => {
            console.error("Error getting chat history: ", error);
            return [];
        });
    }
    
    /**
     * @description This is the initlize function that is called at the beginning of createing the session. 
     * It handles the user authentication and session initialization
     * @param {string} session_id
     * @throws {AuthorizationError} if the user is not authorized
     * @def uuidv4 is for generating a session id because it will generate at high level of condifence an unique id
     * @calls initializeUser to initialize the user
     * @calls initializeHandlers to initialize the handlers
     * @calls Communicator to initialize the communicator 
     */
    private async _initialize(session_id?: string) {
        try {
            this._initializeUser();
        } catch (error) {
            if (error instanceof AuthorizationError) {
                throw error;
            }
            else {
                throw new AuthorizationError("User not authorized");
            }
        }
        if (this._user) {
            if(session_id) {
                this.session_id = xss(session_id);
                const isValid = await this.manager.validActiveSession(session_id);
                if(!isValid) {
                    this.session_id = uuidv4();  // session id is invalid so we create a new one
                }
            }
            else {
                this.session_id = uuidv4();  // ui didn't give us a session id so we create a new one
            }
            this._communicator = new Communicator(this.session_id, this._user.userId as string);
            this._initializeHandlers();
            // Get settings for the user
            try {
                this.settings = this._settings.getSettings();
            } catch (error) {
                throw error;
            }
        }
        else {
            throw new AuthorizationError("User not authorized");
        }
        this.manager.addActiveSession(this.session_id);
    }
    
    /** 
    * @description This is a function that initializes the user object
    * @calls User to initialize the user 
    * @def constant useauth is used to determine if we are using authentication
    * @find description of the user object in the User class
    */
    private async _initializeUser() {
        if (!this._user && constants.useauth)
        {
            this._user = new User(false); // populate user from auth
        }
        this._user = new User(true); // anonymous user
    }
     /** 
    * @description This is a function that initializes the handlers
    * @calls Chat to initialize the chat handler
    * @calls Feedback to initialize the feedback handler
    * @calls History to initialize the history handler
    * @find description of the chat, feedback, and history objects in their respective classes
    * @find description of the communicator object in the Communicator class
    */
    private _initializeHandlers() {
        if (!this.session_id) {
            throw new SessionError("Session ID not defined"); // This should never happen
        }
        else if (!this._user || !this._user.userId) {
            throw new AuthorizationError("User not defined"); // This should never happen
        }
        else {
            this._chat = new Chat(this._communicator);
            this._feedback = new Feedback(this._communicator);
            this._chat_history = new ChatHistory(this._communicator);
            this._settings = new Settings(this._communicator);
        }
    }

    public handleStarClick(star: number, chatId?: string, sessionId?: string) {
        const fb: FeedbackObject = {
            chatId: chatId as string,
            star: star
        };
        this.sendFeedback(fb);
    }
    
    
    public handleTextFeedbackSubmit(feedback: string, chatId?: string, sessionId?: string) {
        const fb: FeedbackObject = {
            chatId: chatId as string,
            feedback: feedback
        };
        this.sendFeedback(fb);
    }

    [Symbol.dispose]() {
        if (this._chat) this._chat[Symbol.dispose]();
        if (this._feedback) this._feedback[Symbol.dispose]();
        if (this._chat_history) this._chat_history[Symbol.dispose]();
        if (this._user) this._user[Symbol.dispose]();
        if (this._communicator) this._communicator[Symbol.dispose]();
    }
};
