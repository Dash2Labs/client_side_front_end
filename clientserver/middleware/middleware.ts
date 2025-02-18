import { getSizeInBytes } from '../Utilities/Utility.js';
import xss from 'xss';
import crypto from 'crypto';
import { express, constants } from '../common_imports.js';

interface SizeLimitRequest extends express.Request {
    body: any;
    headers: any;
    query: any;
    params: any;
}

interface SizeLimitResponse extends express.Response {}

interface SizeLimitNextFunction extends express.NextFunction {}

export const sizeLimit = (req: SizeLimitRequest, res: SizeLimitResponse, next: SizeLimitNextFunction): void => {
    const size = getSizeInBytes(req.body) + getSizeInBytes(req.headers) + getSizeInBytes(req.query) + getSizeInBytes(req.params);
    if (size > constants.maxLength) {
        res.status(400).send('Request too long');
        // TODO: Add logging here
        return;
    }
    next();
};

export const xssCheck = (req: SizeLimitRequest, res: SizeLimitResponse, next: SizeLimitNextFunction): void => {
    let fail = false;
    if (req.body !== undefined) {
        const stringifiedBody = JSON.stringify(req.body);
        const hashBody = crypto.createHash('sha256').update(stringifiedBody).digest('hex');
        fail = fail || hashBody !== crypto.createHash('sha256').update(xss(stringifiedBody)).digest('hex');
    }
    if (req.headers !== undefined) {
        const stringifiedHeaders = JSON.stringify(req.headers);
        const hashHeaders = crypto.createHash('sha256').update(stringifiedHeaders).digest('hex');
        fail = fail || hashHeaders !== crypto.createHash('sha256').update(xss(stringifiedHeaders)).digest('hex');
    }
    if (req.query !== undefined) {
        const stringifiedQueryParmaeters = JSON.stringify(req.query);
        const hashQueryParameters = crypto.createHash('sha256').update(stringifiedQueryParmaeters).digest('hex');
        fail = fail || hashQueryParameters !== crypto.createHash('sha256').update(xss(stringifiedQueryParmaeters)).digest('hex');
    }
    if (req.params !== undefined) {
        const stringifiedParmaeters = JSON.stringify(req.params);
        const hashParameters = crypto.createHash('sha256').update(stringifiedParmaeters).digest('hex');
        fail = fail || hashParameters !== crypto.createHash('sha256').update(xss(stringifiedParmaeters)).digest('hex');
    }
    // check if the hash of the body and headers are the same as the hash of the xss sanitized
    // body and headers
    if (fail) {
        console.error('Invalid characters in request');
        res.status(400).send('Invalid characters in request');
    }
    next();
};
