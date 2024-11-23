/**
 * @file index.ts
 * @description This file contains the main entry point for the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import express from 'express';
import { resolvePath, _dirname_ } from './common_imports.ts';
import * as dotx from '@dotenvx/dotenvx';
dotx.config();
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

APP.use(bodyParser.json());
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
