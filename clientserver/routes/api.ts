import { express, axios, constants, defaultHeaders, uuiv4, handleResponse } from '../common_imports.js';
import er from '../errors.js';

interface ChatObject {
    question: string;
}

const ax = axios.default;
const api = express.Router();

api.post('/api/chat', (req, res) => {
    if (!req.body.question) {
        res.status(400).send('No question provided');
    };

    const question: ChatObject = req.body;
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const options = { headers: { ...headers, "correlation-id": correlationId } };

    ax.post(`${constants.server}/api/chat`, question, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
    });
});

api.post('/api/feedback', (req, res) => {
    if (!req.body.feedback) {
        res.status(400).send('No feedback provided');
    };

    const feedback = req.body;
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const options = { headers: { ...headers, "correlation-id": correlationId } };

    ax.post(`${constants.server}/api/feedback`, feedback, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
    });
});

api.get('/api/history', (req, res) => {
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const options = { headers: { ...headers, "correlation-id": correlationId } };

    ax.get(`${constants.server}/api/history`, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
    });
});

api.get('/api/settings', (req, res) => {
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const options = { headers: { ...headers, "correlation-id": correlationId } };

    ax.get(`${constants.server}/api/settings`, options).then((response) => {
        handleResponse(res, response, correlationId);
    }).catch(() => {
        res.status(500).send(er.serverError);
    });
});

api.post('/api/settings', (req, res) => {
    if (!req.body.settings) {
        res.status(400).send('No settings provided');
    };

    const settings = req.body;
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const options = { headers: { ...headers, "correlation-id": correlationId } };

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

api.get('/api/settings', (req, res) => {
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const options = { headers: { ...headers, "correlation-id": correlationId } };
    const client_settings = constants.client_settings;

    if (constants.useAuth) {
        ax.get(`${constants.server}/api/settings`, options).then((response) => {
            response.data = { user_settings: response.data, ...client_settings };
            handleResponse(res, response, correlationId);
        }).catch(() => {
            res.status(503).send({user_settings: er.serverError, ...client_settings});
        });
    } else {
        res.status(200).send({...client_settings});
    };
});


export default api;