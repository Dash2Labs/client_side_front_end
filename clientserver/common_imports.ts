import { resolvePath } from './resolve_ts_path.ts';
import { fileURLToPath } from 'url';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'node:fs';
import * as axios from 'axios';
import { constants } from './constants.js';
import { v4 as uuiv4 } from 'uuid';
import er from './errors.ts';
import { SessionManager } from './SessionManager.ts';
import xss from 'xss';

const _filename_ = (import_meta_url: string) => fileURLToPath(import_meta_url);
const _dirname_ = (import_meta_url: string) => path.dirname(_filename_(import_meta_url));
const defaultHeaders = {
};
const handleResponse = (res: express.Response, response: axios.AxiosResponse, correlationId: string) => {
    if (response.status >= 200 && response.status < 300) {
        res.status(200).appendHeader("correlation-id",correlationId).send(response.data);
    } else if (response.status >= 400 && response.status < 500) {
        res.status(400).appendHeader("correlation-id",correlationId).send(er.userError);
    } else if (response.status >= 500) {
        res.status(500).appendHeader("correlation-id",correlationId).send(er.serverError);
    } else {
        res.status(response.status).appendHeader("correlation-id",correlationId).send(er.unknownError);
    }
};

const addCommonHeaders = (req: express.Request) => {
    const dash2labs_user_id = "dash2labs-user-id";
    const dash2labs_session_id = "dash2labs-session-id";
    const headers = defaultHeaders;
    const correlationId = uuiv4();
    const userIdHeader = req.headers[dash2labs_user_id];
    const userId: string = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader || "";
    const sessionIdHeader = req.headers[dash2labs_session_id];
    const sessionId: string = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader || "";
    const options = { headers: { ...headers, "correlation-id": correlationId, "dash2labs-user-id": userId, "dash2labs-session-id": sessionId } };
    return options;
};

const checkSession = (res: express.Response, sessionId: string) => {
    if (sessionId === "" || !SessionManager.updateActiveSession(sessionId)) {
        res.status(403).setHeader("dash2labs-session-id", sessionId).send('Session is not active');
        // TODO: Add logging here
    }
}

export { express,
         axios,
         path,
         fs,
         resolvePath,
         _dirname_,
         _filename_,
         constants,
         defaultHeaders,
         uuiv4,
         handleResponse,
         addCommonHeaders,
         checkSession,
         SessionManager,
         xss };