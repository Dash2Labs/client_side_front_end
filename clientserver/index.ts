/**
 * @file index.ts
 * @description This file contains the main entry point for the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import express, { Router } from 'express';
import { path, fs, resolvePath, _dirname_ } from './common_imports.js';
import * as dotx from '@dotenvx/dotenvx';
dotx.config();
import logger from 'morgan';
import compression from 'compression';
import serveStatic from './serve_static.js';
import session from './routes/session.js';
import api from './routes/api.js';
import root from './routes/root.js';

if (process.env.NODE_ENV === 'production') {
    console.log("Client Server is running in PRODUCTION mode");
} else {
    console.log("Client Server is running in DEVELOPMENT mode");
};

const routes: { [key: string]: Router } = {};
const APP = express();
const PORT = process.env.PORT || 3000;

APP.use('/', root);
APP.use('/api', api);
APP.use('/session', session);
APP.use(express.static(resolvePath('@public')));
APP.use(express.json());
APP.use(logger('tiny'));
APP.use(compression());
APP.use(serveStatic([resolvePath('@public'), resolvePath('@assets')]));
APP.listen(PORT, () => {
    console.log(`Server is running on ${process.env.URL}:${PORT}`);
});
