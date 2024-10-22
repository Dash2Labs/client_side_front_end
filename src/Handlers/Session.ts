/**
 * @file Session.ts
 * @description This file contains the Session class which handles user sessions. And the HandleSignIn event emitter class which handles user sign in and sign out.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import { v4 as uuidv4 } from 'uuid';
import Chat from './Chat.js';
import Feedback from './Feedback.js';
import History from './History.js';
import User from '../Models/User.js';
import { constants } from '../constants.js';
import AuthorizationError from '../Authorization/Errors/AuthorizationError.js';
import SessionError from './Errors/SessionError.js';
import Communicator from './Communicator.js';
import { ChatObject } from './Chat.js';
import { FeedbackObject } from './Feedback.js';
import { HistoryObject } from './History.js';
import { EventEmitter } from 'events';
import SessionManager from '../Managers/Session.ts';

export class Session {
    private _chat!: Chat;
    private _feedback!: Feedback;
    private _history!: History;
    private _user!: User;
    private _communicator!: Communicator;
    public createdAt!: Date;
    public expiresAt: Date = new Date(this.createdAt.getTime() + 3600000); // 1 hour
    public session_id!: string;

    constructor(session_id: string | undefined) {
        try {
            this.initialize(session_id);
            this.createdAt = new Date();
        }
        catch (error) {
            if (constants.debug) {
                console.error(error);
            }
            else {
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
        return this._chat.sendQuestion(question);
    }

    /**
     * @description This is a callback function for the ui to send feedback
     */
    public sendFeedback(feedback: FeedbackObject) {
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
    }

    /**
     *@description This is a callback function for the ui to set configuration settings  
     */
     public setSettings() {
    }

    // TODO: Since we are setting configuration for the user we should be able to save their configuration
    

    private initialize(session_id: string | undefined) {
        this.initializeUser();
        if (this._user) {
            if(session_id) {
                this.session_id = session_id;  //TODO: validate session id
            }
            else {
                this.session_id = uuidv4();  // ui didn't give us a session id so we create a new one
            }
            this._communicator = new Communicator(this.session_id, this._user.user_id as string);
            this.initializeHandlers();
        }
        else {
            throw new AuthorizationError("User not authorized");
        }
    }

    private initializeUser() {
        if (!this._user && constants.useauth)
        {
            this._user = new User(false); // populate user from auth
        }
        this._user = new User(true); // anonymous user
    }

    private initializeHandlers() {
        if (!this.session_id) {
            throw new SessionError("Session ID not defined"); // This should never happen
        }
        else if (!this._user || !this._user.user_id) {
            throw new SessionError("User not defined"); // This should never happen
        }
        else {
            this._chat = new Chat(this._communicator);
            this._feedback = new Feedback(this._communicator);
            this._history = new History(this._communicator);
        }
    }

    [Symbol.dispose]() {
        this._chat[Symbol.dispose]();
        this._feedback[Symbol.dispose]();
        this._history[Symbol.dispose]();
        this._user[Symbol.dispose]();
        this._communicator[Symbol.dispose]();
    }
}

class HandleSignIn extends EventEmitter {
    private _session_id!: string;
    public _session?: Session;

    constructor() {
        super();
        this._session_id = this.getSessionFromCookie();
    }

    public signIn() {
        if (!this._session) {
                this._session = new Session(this._session_id);
        }
        SessionManager.addSession(this._session as Session);
        this.emit("signedIn", this._session);
    }

    public signOut() {
        if (this._session) {
            SessionManager.removeSession(this._session.session_id);
            this.setSessionCookie(this._session_id);
            this._session = undefined;
            this._session_id = "";  
            this.emit("signedOut", this._session);
        }
    }

    private getSessionFromCookie() {
        return "";
    }

    private setSessionCookie(session_id: string) {
    }
}

export default HandleSignIn;