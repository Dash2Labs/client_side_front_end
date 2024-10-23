import { express, axios, constants, defaultHeaders, uuiv4, handleResponse } from '../common_imports.js';
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

api.post('/api/chat', (req, res) => {
    if (getSizeInBytes(req) > constants.maxLength) {
        res.status(400).send('Question too long');
        return;
    };
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in question');
        return;
    };
    if (!req.body.question) {
        res.status(400).send('No question provided');
    };

    const question: ChatObject = req.body;
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = req.headers[dash2labs_user_id];
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId } };

    ax.post(`${constants.server}/api/chat`, question, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
    });
});

api.post('/api/feedback', (req, res) => {
    if (getSizeInBytes(req) > constants.maxLength) {
        res.status(400).send('Feedback too long');
        return;
    };
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in feedback');
        return;
    };
    if (!req.body.feedback) {
        res.status(400).send('No feedback provided');
        return;
    };
    const feedback: FeedbackObject = req.body;

    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = req.headers[dash2labs_user_id];
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId } };

    ax.post(`${constants.server}/api/feedback`, feedback, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
    });
});

api.get('/api/history', (req, res) => {
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in history request');
        return;
    };
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = req.headers[dash2labs_user_id];
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId } };

    if (!constants.useAuth) {
        ax.get(`${constants.server}/api/history/random`, options).then((response) => {
            handleResponse(res, response, correlationId);
        }).catch(() => {
            res.status(500).send(er.serverError);
        });
    } else {
        ax.get(`${constants.server}/api/history`, options).then((response) => {
            handleResponse(res, response, correlationId);
        }).catch(() => {
            res.status(500).send(er.serverError);
        });
    }
});

api.get('/api/settings', (req, res) => {
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in settings request');
        return;
    };
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = req.headers[dash2labs_user_id];
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId } };

    ax.get(`${constants.server}/api/settings`, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
    });
});

api.post('/api/settings', (req, res) => {
    if (getSizeInBytes(req) > constants.maxLength) {
        res.status(400).send('Settings too long');
        return;
    };
    if (JSON.stringify(req).length !== xss(JSON.stringify(req)).length) {
        res.status(400).send('Invalid characters in settings post request');
        return;
    };
    if (!req.body.settings) {
        res.status(400).send('No settings provided');
    };

    const settings = req.body;
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userId = req.headers[dash2labs_user_id];
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId } };

    if (constants.useAuth) {
        ax.post(`${constants.server}/api/settings`, settings, options).then((response) => {
            handleResponse(res, response, correlationId);
        }).catch(() => {
            res.status(500).send(er.serverError);
        });
    } else {
        res.status(403).send(er.userError);
    };
});

export default api;