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

if (process.env.NODE_ENV === 'production') {
    console.log("Client Server is running in PRODUCTION mode");
} else {
    console.log("Client Server is running in DEVELOPMENT mode");
};

const routes: { [key: string]: Router } = {};
const APP = express();
const PORT = process.env.PORT || 3000;

loadRoutes().then(() => {
    for (const [route, router] of Object.entries(routes)) {
        if (route !== "root") {
            APP.use(`/${route}`, router);
        } else {
            APP.use('/', router);
        }
    }
}).catch((error) => {
    console.error('Error loading routes:', error);
});

APP.use(express.static(resolvePath('@public')));
APP.use(express.json());
APP.use(logger('tiny'));
APP.use(compression());
APP.use(serveStatic([resolvePath('@public'), resolvePath('@assets')]));
APP.listen(PORT, () => {
    console.log(`Server is running on ${process.env.URL}:${PORT}`);
});

///////////////////////////////////////////////// 
// Import all routes
/////////////////////////////////////////////////
async function loadRoutes() {
    const routesPath = path.join(_dirname_(import.meta.url), 'routes');
    const files = fs.readdirSync(routesPath).filter((file) => file.endsWith('.js'));

    for (const file of files) {
        const imprt = path.join(routesPath, file);
        const route = file.substring(0, file.indexOf('.js'));

        try {
            const importedRoute = await import(imprt);
            routes[route] = importedRoute.default;
        } catch (error) {
            console.error(`Failed to import ${imprt}:`, error);
        }
    }
    console.info('Routes loaded:', Object.keys(routes));
}