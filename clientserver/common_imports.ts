import { resolvePath } from './resolve_ts_path.js';
import { fileURLToPath } from 'url';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'node:fs';
import * as axios from 'axios';
import { constants } from './constants.js';
import { v4 as uuiv4 } from 'uuid';
import er from './errors.js';

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
         handleResponse };