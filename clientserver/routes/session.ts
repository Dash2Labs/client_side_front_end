/**
 * @file session.ts
 * @description This file contains the session route which validates the user session.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { express,
         SessionManager,
         xss } from '../common_imports.js';

const session = express.Router();
session.get('/session/active/:session_id', (req, res) => {
    const session_id = xss(req.params.session_id);
    if (SessionManager.validActiveSession(session_id)) {
        res.status(200).send('Session is active');
    } else {
        res.status(403).send('Session is not active');
    }
});

session.post(`/session/active/:session_id`, (req, res) => {
    const session_id = xss(req.params.session_id);
    if (SessionManager.validActiveSession(session_id)) {
        res.status(200).send('Session is active');
    } else {
        res.status(403).send('Session is not active');
    }
});

export default session;