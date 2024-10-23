/**
 * @file Session.ts
 * @description This file contains the Session class which handles user sessions.
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import { v4 as uuidv4 } from 'uuid';
import Chat, { ChatObject } from './Chat.ts';
import Feedback, { FeedbackObject } from './Feedback.ts';
import History, { HistoryObject } from './History.ts';
import Settings, { SettingsObject } from './Settings.ts';
import User from '../Models/User.ts';
import { constants } from '../constants.js';
import AuthorizationError from '../Authorization/Errors/AuthorizationError.ts';
import SessionError, { ChatSessionError, SettingsSessionError }  from './Errors/SessionError.ts';
import Communicator from './Communicator.ts';
import { getSizeInBytes } from '../Utilities/Utility.ts';

export default class Session {
    private _chat!: Chat; // this is the chat handler is resposible for sending and receiving chat messages
    private _feedback!: Feedback;  // this is the feedback handler is resposible for sending and receiving feedback
    private _history!: History; // this is the history handler is resposible for getting the history
    private _settings!: Settings; // this is the settings handler is resposible for getting and setting the settings
    private _user!: User; // this is the user object that is used to authenticate the user
    private _communicator!: Communicator; // this is the communicator object that is used to send and receive messages from the server
    public createdAt!: Date; // this is the date the session was created
    public expiresAt!: Date; // this is the date the session will expire
    public session_id!: string; // this is the session id that is used to identify the session

    /*
    * @description This is the constructor for the Session class
    * @param {string}
    * calls the initialize function. Which handles the user authentication and session initialization
    */
    constructor(session_id?: string) {
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
                    throw new SessionError("Session initialization failed: Unknown error");
                }
            }
        }
    }

    /**
     * @description This is a callback function for the ui to send a chat message
     */
    public sendChat(question: ChatObject) {
        if (question.question.length === 0 || getSizeInBytes(question) > constants.maxLength) {
            throw new ChatSessionError("Invalid Question Length");
        }
        return this._chat.sendQuestion(question);
    }

    /**
     * @description This is a callback function for the ui to send feedback
     */
    public sendFeedback(feedback: FeedbackObject) {
        if (getSizeInBytes(feedback) > constants.maxLength) {
            console.error("Feedback too long"); // won't throw for feedback error
        }
        return this._feedback.sendFeedback(feedback);
    }

    /**
     * @description This is a callback function for the ui to get the history
     */
    public getHistory(): HistoryObject {
        return this._history.getHistory();
    }

    /**
     *@description This is a callback function for the ui to get configuration settings  
     */
     public getSettings() {
        return this._settings.getSettings();
    }

    /**
     *@description This is a callback function for the ui to set configuration settings  
     */
     public setSettings(settings: SettingsObject) {
        if (getSizeInBytes(settings) > constants.maxLength) {
            throw new SettingsSessionError("Settings too long");
        }
        this._settings.setSettings(settings);
    }

    // TODO: Since we are setting configuration for the user we should be able to save their configuration
    
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
    private _initialize(session_id?: string) {
        this._initializeUser();
        if (this._user) {
            if(session_id) {
                this.session_id = session_id;  //TODO: validate session id
            }
            else {
                this.session_id = uuidv4();  // ui didn't give us a session id so we create a new one
            }
            this._communicator = new Communicator(this.session_id, this._user.user_id as string);
            this._initializeHandlers();
        }
        else {
            throw new AuthorizationError("User not authorized");
        }
    }
    
    /** 
    * @description This is a function that initializes the user object
    * @calls User to initialize the user 
    * @def constant useauth is used to determine if we are using authentication
    * @find description of the user object in the User class
    */
    private _initializeUser() {
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
        else if (!this._user || !this._user.user_id) {
            throw new AuthorizationError("User not defined"); // This should never happen
        }
        else {
            this._chat = new Chat(this._communicator);
            this._feedback = new Feedback(this._communicator);
            this._history = new History(this._communicator);
            this._settings = new Settings(this._communicator);
        }
    }

    [Symbol.dispose]() {
        if (this._chat) this._chat[Symbol.dispose]();
        if (this._feedback) this._feedback[Symbol.dispose]();
        if (this._history) this._history[Symbol.dispose]();
        if (this._user) this._user[Symbol.dispose]();
        if (this._communicator) this._communicator[Symbol.dispose]();
    }
};
