import express from 'express';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diagLog = path.join(__dirname, '../chatbot_diagnostics.log');

const logDiag = (msg) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(diagLog, `[${timestamp}] ${msg}\n`);
};

const router = express.Router();

const SYSTEM_PROMPT = `You are a helpful AI for "Unified Operations Platform".
Help users navigate pages: Dashboard (/dashboard), Inbox (/inbox), Bookings (/bookings), Forms (/forms), Inventory (/inventory), Team (/team), Automation (/automation), Services (/services), Settings (/settings).
Guide them on workflows like service setup, confirming bookings, sending forms, and managing stock.
Be concise, friendly, and suggest specific pages/buttons.`;

// POST /api/chatbot - Send message to Mistral
router.post('/', authenticate, async (req, res) => {
    try {
        const { messages } = req.body;
        const authHeader = req.headers.authorization;
        logDiag(`Request received. Auth header: ${authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING'}`);

        if (!messages || !Array.isArray(messages)) {
            logDiag('Error: Invalid messages array');
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            logDiag('Error: MISTRAL_API_KEY missing from environment');
            return res.status(500).json({ error: 'Mistral API key not configured' });
        }

        logDiag(`Calling Mistral with ${messages.length} messages. API Key prefix: ${apiKey.substring(0, 4)}...`);

        // Build the full message array with system prompt
        const fullMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8500);

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: fullMessages,
                max_tokens: 512,
                temperature: 0.7,
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logDiag(`Mistral API error (${response.status}): ${JSON.stringify(errorData)}`);
            console.error('❌ Mistral API error:', response.status, JSON.stringify(errorData, null, 2));
            return res.status(response.status).json({ error: 'Failed to get AI response', details: errorData });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

        logDiag('Success: Reply generated.');
        res.json({ reply });
    } catch (error) {
        logDiag(`Internal server error: ${error.message}\n${error.stack}`);
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
