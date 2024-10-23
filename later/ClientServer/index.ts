import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import os from 'node:os';
import logger from 'morgan';
import path, { dirname } from 'path';
import compression from 'compression';
import multer from 'multer';
const upload = multer({ dest: os.tmpdir() });
import { chatbot } from './controllers/chatBotClientSideController.js';
import { serveStatic } from './controllers/serveStatic.js';
import { fileURLToPath } from 'url';
import router from './routes/api.js';
import cors from 'cors';
import { constants } from './constants.js';

let ADDRESS: string;
if (process.env.NODE_ENV === 'production') {
    console.log("Client Server is running in PRODUCTION mode");
    ADDRESS = constants.client_server_ip;
    process.env.BASE_URL = process.env.BASE_URL_PROD;
    process.env.CLIENT_URL = process.env.CLIENT_URL_PROD;
} else {
    console.log("Client Server is running in DEVELOPMENT mode");
    ADDRESS = "localhost";
    process.env.BASE_URL = process.env.BASE_URL_DEV;
    process.env.CLIENT_URL = process.env.CLIENT_URL_DEV;
}

const corsOptions = {
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200,
    methods: "POST",
    allowedHeaders: ["Content-Type", "Authorization", "Dash2Labs-Thread-Id", "Accept", "Origin", "X-Requested-With"]
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT: number = parseInt(process.env.CLIENT_PORT ?? "") || 3000 as number;
const PUBLIC_DIR: string = path.resolve(__dirname, '.', 'public');
const ASSETS_DIR: string = path.resolve(__dirname, '.', 'assets');
const app = express();

app.use(express.json());
app.use(logger('tiny'));
app.use(compression());
app.get('/', chatbot.serve(PUBLIC_DIR));
app.get('/chat', chatbot.serve(PUBLIC_DIR));
app.get('/login', chatbot.serve(PUBLIC_DIR));
app.get('/logout', chatbot.serve(PUBLIC_DIR));
app.options('/upload', cors())
app.post('/api/feedback', chatbot.handleFeedback);

app.use(serveStatic(PUBLIC_DIR, ASSETS_DIR));
app.use('/api', router);

app.listen(PORT, ADDRESS, () => {
    console.log("Server listening on port", PORT, "address: ", ADDRESS);
});
