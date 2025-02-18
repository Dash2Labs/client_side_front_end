/**
 * @file index.ts
 * @description This file contains the main entry point for the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import express from 'express';
import http from 'http';
import https from 'https';
import { resolvePath, _dirname_ } from './common_imports.js';
import logger from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import serveStatic from './serve_static.js';
import session from './routes/session.js';
import api from './routes/api.js';
import root from './routes/root.js';

let dev = true;
if (process.env.NODE_ENV === 'production') {
    console.log("Client Server is running in PRODUCTION mode");
    dev = false;
} else {
    console.log("Client Server is running in DEVELOPMENT mode");
};

const APP = express();
const PORT = process.env.PORT || 3000;

APP.use((req, res, next) => {
    if (req.secure) {
        next();
    } else {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
    }});
APP.use(bodyParser.json());
APP.use('/', root);
APP.use('/api', api);
APP.use('/session', session);
APP.use(express.static(resolvePath('@public')));
APP.use(express.json());
APP.use(logger('tiny'));
APP.use(compression());
APP.use(serveStatic([resolvePath('@public'), resolvePath('@assets')]));

const SERVER = http.createServer(APP);
console.log(resolvePath('@certs/key.pem'));
console.log(resolvePath('@certs/cert.pem'));
const HTTPS_SERVER = https.createServer({
    key: resolvePath('@certs/chat_private.key'),
    cert: resolvePath('@certs/chat_cert.pm')
}, APP);

SERVER.listen(PORT, () => {
    console.log(`Server is running on ${process.env.URL}:${PORT} in ${process.env.NODE_ENV} mode`);
});

HTTPS_SERVER.listen(443, () => {
    console.log(`HTTPS Server is running on ${process.env.URL}:443 in ${process.env.NODE_ENV} mode`);
});
