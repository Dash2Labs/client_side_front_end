/**
 * @file Session.ts
 * @description This file contains the Session class which handles user sessions.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Chat from './Chat.js';
import Feedback from './Feedback.js';
import History from './History.js';
import User from '../Models/User.js';
import { constants } from '../constants.js';

class Session {
    private chat!: Chat;
    private feedback!: Feedback;
    private history!: History;
    private user!: User;
    
    constructor() {
        try {
            this.initialize();
        }
        catch (error) {
            // TODO: Tell the UI somehow there is an error
        }
    }

    private initialize() {
        this.initializeUser();
        this.chat = new Chat();
        this.feedback = new Feedback();
        this.history = new History();
    }

    private initializeUser() {
        if (!this.user && constants.useauth)
        {
            // populate user from auth
            this.user = new User(false);
        }
        this.user = new User(true);
    }

    private getUserFromUI() {
        return {}
    }
    // Session class implementation
}

export default Session;