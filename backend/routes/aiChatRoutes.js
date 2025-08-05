// server/routes/aiChatRoutes.js

import express from 'express';
import { chatWithAI, getAIChatSuggestions, getChatLimits, getChatHistory, getDailyInsight } from '../controllers/aiChatController.js';

import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/usercontroller.js';
const Chatrouter = express.Router();

// Chat with AI
Chatrouter.post('/chat', userAuth, chatWithAI);

// Get AI chat suggestions
Chatrouter.get('/suggestions', userAuth, getAIChatSuggestions);


Chatrouter.get('/limits',userAuth,getChatLimits);

Chatrouter.get("/history", userAuth, getChatHistory);

Chatrouter.get('/get-daily-insight', userAuth, getDailyInsight);

export default Chatrouter;