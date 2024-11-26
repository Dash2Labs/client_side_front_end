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
import { resolvePath, _dirname_ } from './common_imports.ts';
import * as dotx from '@dotenvx/dotenvx';
dotx.config({path: '@certs/.env'});
import logger from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import serveStatic from './serve_static.ts';
import session from './routes/session.ts';
import api from './routes/api.ts';
import root from './routes/root.ts';

if (process.env.NODE_ENV === 'production') {
    console.log("Client Server is running in PRODUCTION mode");
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
const HTTPS_SERVER = https.createServer({
    key: resolvePath('@certs/key.pem'),
    cert: resolvePath('@certs/cert.pem')
}, APP);

SERVER.listen(PORT, () => {
    console.log(`Server is running on ${process.env.URL}:${PORT}`);
});

HTTPS_SERVER.listen(443, () => {
    console.log(`HTTPS Server is running on ${process.env.URL}:443`);
});
