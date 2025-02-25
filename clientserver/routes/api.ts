/**
 * @file api.ts
 * @description This file contains the API routes for the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { express, axios, constants, handleResponse, checkSession, addCommonHeaders } from '../common_imports.js';
import { sizeLimit, xssCheck } from '../middleware/middleware.js';
import er from '../errors.js';
import { FeedbackObject } from '../../src/Models/Feedback.js';

interface ChatObject {
    question: string;
}

const ax = axios.default;
const api = express.Router();

api.post('*', sizeLimit);
api.use(xssCheck);

api.post('/chat', (req, res) => {
    if (req.body && !req.body.question) {
        res.status(400).send('No question provided');
        // TODO: Add logging here
    };

    const question: ChatObject = req.body;
    let options = addCommonHeaders(req);

    checkSession(res, options.headers['dash2labs-session-id']);
    

    ax.post(`${constants.server}/api/chat`, question, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.post('/feedback', (req, res) => {
    if (!req.body.feedback) {
        res.status(400).send('No feedback provided');
        // TODO: Add logging here
        return;
    };
    const feedback: FeedbackObject = req.body;
    let options = addCommonHeaders(req);

    ax.post(`${constants.server}/api/feedback`, feedback, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.get('/chats/:session_id', (req, res) => {
    const session_id = req.params.session_id;
    const queryParams = req.query;
    let startId = "0";
    let length = "5";
    if (queryParams && queryParams.startId) {
        startId = queryParams.startId as string;
    }
    if (queryParams && queryParams.length) {
        length = queryParams.length as string;
    }
    let options = addCommonHeaders(req);
    checkSession(res, options.headers['dash2labs-session-id']);

    ax.get(`${constants.server}/api/chats/${session_id}/?startId=${startId}&length=${length}`, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.get('/settings', (req, res) => {
    let options = addCommonHeaders(req);
    checkSession(res, options.headers['dash2labs-session-id']);

    ax.get(`${constants.server}/api/settings`, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.post('/settings', (req, res) => {
    if (!req.body.settings) {
        res.status(400).send('No settings provided');
        // TODO: Add logging here
    };

    const settings = req.body;
    let options = addCommonHeaders(req);
    checkSession(res, options.headers['dash2labs-session-id']);


    if (constants.useAuth) {
        ax.post(`${constants.server}/api/settings`, settings, options).then((response) => {
            handleResponse(res, response, options.headers['correlation-id']);
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