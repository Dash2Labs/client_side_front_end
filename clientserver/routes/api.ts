/**
 * @file api.ts
 * @description This file contains the API routes for the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { express, axios, constants, defaultHeaders, uuiv4, handleResponse, cleanHeader, checkSession } from '../common_imports.js';
import er from '../errors.js';
import { getSizeInBytes } from '../Utilities/Utility.js';
import xss from 'xss';

interface ChatObject {
    question: string;
}

interface FeedbackObject {
    feedback: string;
    feedbackId: string;
    question: string;
    response: string;
    responseTime: number;
}

const ax = axios.default;
const api = express.Router();
const dash2labs_user_id = "dash2labs-user-id";
const dash2labs_session_id = "dash2labs-session-id";

api.post('/chat', (req, res) => {
    if (getSizeInBytes(req) > constants.maxLength) {
        res.status(400).send('Question too long');
        // TODO: Add logging here
        return;
    };
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) { //TODO: Check if this works.  I am unsure if stringify the entire request will work.
        res.status(400).send('Invalid characters in question');
        // TODO: Add logging here
        return;
    };
    if (!req.body.question) {
        res.status(400).send('No question provided');
        // TODO: Add logging here
    };

    const question: ChatObject = req.body;
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = cleanHeader(req, dash2labs_user_id);
    const sessionId: string = cleanHeader(req, dash2labs_session_id);
    checkSession(res, sessionId);
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId, "dash2labs-session-id": sessionId } };

    ax.post(`${constants.server}/api/chat`, question, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.post('/feedback', (req, res) => {
    if (getSizeInBytes(req) > constants.maxLength) {
        res.status(400).send('Feedback too long');
        // TODO: Add logging here
        return;
    };
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in feedback');
        // TODO: Add logging here
        return;
    };
    if (!req.body.feedback) {
        res.status(400).send('No feedback provided');
        // TODO: Add logging here
        return;
    };
    const feedback: FeedbackObject = req.body;

    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = cleanHeader(req, dash2labs_user_id);
    const sessionId: string = cleanHeader(req, dash2labs_session_id);  // check session not necessary on feedback route

    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId, "dash2labs-session-id": sessionId } };

    ax.post(`${constants.server}/api/feedback`, feedback, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.get('/history', (req, res) => {
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in history request');
        // TODO: Add logging here
        return;
    };
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = cleanHeader(req, dash2labs_user_id);
    const sessionId: string = cleanHeader(req, dash2labs_session_id);
    checkSession(res, sessionId);
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId, "dash2labs-session-id": sessionId } };

    ax.get(`${constants.server}/api/history`, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.get('/settings', (req, res) => {
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in settings request');
        // TODO: Add logging here
        return;
    };
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = cleanHeader(req, dash2labs_user_id);
    const sessionId: string = cleanHeader(req, dash2labs_session_id);
    checkSession(res, sessionId);
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId, "dash2labs-session-id": sessionId } };

    ax.get(`${constants.server}/api/settings`, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.post('/settings', (req, res) => {
    if (getSizeInBytes(req) > constants.maxLength) {
        res.status(400).send('Settings too long');
        // TODO: Add logging here
        return;
    };
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in settings post request');
        // TODO: Add logging here
        return;
    };
    if (!req.body.settings) {
        res.status(400).send('No settings provided');
        // TODO: Add logging here
    };

    const settings = req.body;
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = cleanHeader(req, dash2labs_user_id);
    const sessionId: string = cleanHeader(req, dash2labs_session_id);
    checkSession(res, sessionId);
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId, "dash2labs-session-id": sessionId } };

    if (constants.useAuth) {
        ax.post(`${constants.server}/api/settings`, settings, options).then((response) => {
            handleResponse(res, response, correlationId);
        }).catch(() => {
            res.status(500).send(er.serverError);
            // TODO: Add logging here
        });
    } else {
        res.status(403).send(er.userError);
        // TODO: Add logging here
    };
});

export default api;