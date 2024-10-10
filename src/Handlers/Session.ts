/**
 * @file Session.ts
 * @description This file contains the Session class which handles user sessions.
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

class Session {
    private _chat!: Chat;
    private _feedback!: Feedback;
    private _history!: History;
    private _user!: User;
    private _session_id!: string;
    private _communicator!: Communicator;
    
    constructor(session_id: string | undefined) {
        try {
            this.initialize(session_id);
        }
        catch (error) {
            if (constants.debug) {
                console.error(error);
            }
            else if (error instanceof AuthorizationError) {
                // TODO: Tell the UI somehow there is an authorization error
            }
            else if (error instanceof SessionError) {
                // TODO: Tell the UI somehow there is a session error
            }
        }
    }

    private initialize(session_id: string | undefined) {
        this.initializeUser();
        if (this._user) {
            if(session_id) {
                this._session_id = session_id;  //TODO: validate session id
            }
            else {
                this._session_id = uuidv4();  // ui didn't give us a session id so we create a new one
            }
            this._communicator = new Communicator(this._session_id, this._user.user_id as string);
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
        if (!this._session_id) {
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

    private getUserFromUI() {
        return {}
    }
}

export default Session;