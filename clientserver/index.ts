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
import { resolvePath, _dirname_, fs } from './common_imports.js';
import logger from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import serveStatic from './serve_static.js';
import session from './routes/session.js';
import api from './routes/api.js';
import root from './routes/root.js';
import dotenv from 'dotenv';


// Load environment variables from .env file
const result = dotenv.config({ path: ".env" });

if (result.error) {
    console.error("Error loading .env file:", result.error);
} else {
    console.log(".env file loaded successfully");
}

let dev = true;
if (process.env.NODE_ENV === 'production') {
    console.log("Client Server is running in PRODUCTION mode");
    dev = false;
} else {
    console.log("Client Server is running in DEVELOPMENT mode");
};

const APP = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const URL = process.env.URL || 'https://localhost';

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
    key: fs.readFileSync(resolvePath('@certs/chat_server.key')),
    cert: fs.readFileSync(resolvePath('@certs/chat_server.cert'))
}, APP);

SERVER.listen(PORT, () => {
    console.log(`Server is running on ${URL}:${PORT} in ${process.env.NODE_ENV} mode`);
});

HTTPS_SERVER.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server is running on ${URL}:${HTTPS_PORT} in ${process.env.NODE_ENV} mode`);
});
