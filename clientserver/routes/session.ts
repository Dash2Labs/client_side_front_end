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
         xss } from '../common_imports.ts';

const session = express.Router();
session.route('/active/:session_id')
    .get((req, res) => {
    const session_id = xss(req.params.session_id);
    if (SessionManager.validActiveSession(session_id)) {
        res.status(200).send('Session is active');
    } else {
        res.status(403).send('Session is not active');
    }
})
    .post((req, res) => {
    const session_id = xss(req.params.session_id);
    if (SessionManager.validActiveSession(session_id)) {
        res.status(200).send('Session is active');
    } else {
        SessionManager.addActiveSession(session_id);
        res.status(200).send('Session is now active');
    }
});

export default session;