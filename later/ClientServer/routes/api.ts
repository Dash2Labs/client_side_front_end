import express from 'express';
import { chatbot } from '../controllers/chatBotClientSideController.js';

const router = express.Router();

router.post('/ask', (req, res) => chatbot.ask(req as any, res));
router.post('/cancel_question', (req, res) => (chatbot.cancelQuestion(req, res)));
router.get('/history', (req, res) => chatbot.getHistory(req as any, res));

export default router;