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

const SYSTEM_PROMPT = `You are a helpful AI assistant for the "Unified Operations Platform" — a business management dashboard. Your job is to help the business owner navigate the platform and answer their questions.

Here is the complete list of pages and features available:

## Pages & Navigation
- **Dashboard** (/dashboard): Overview of business metrics, recent activity, and alerts.
- **Inbox** (/inbox): View and reply to customer conversations. Send messages to contacts via email.
- **Bookings** (/bookings): View, confirm, cancel, or complete customer appointments. Filter by status (pending, confirmed, completed).
- **Forms** (/forms): Create custom intake forms, share them with clients via link or email, and view submissions.
- **Inventory** (/inventory): Track products and supplies. Add items, adjust quantities, set low-stock alerts.
- **Team** (/team): Invite staff members, manage roles and permissions.
- **Automation** (/automation): Set up automated workflows triggered by events like new bookings, form submissions, etc.
- **Services** (/services): Create and manage the services your business offers (name, duration, price). These appear on the public booking page.
- **Settings** (/settings): Configure workspace settings, integrations (email via SMTP), and business info.

## Public Pages (for your customers)
- **Public Booking Page** (/book): Customers can select a service, pick a date/time, and book an appointment.
- **Public Contact Page** (/contact): Customers can reach out with questions.
- **Public Forms** (/forms/public/:formId): Customers can fill out forms you've shared.

## Key Workflows
1. **Setting up services**: Go to Services → Click "Add Service" → Fill in name, duration, price → Save. These services will automatically appear on your booking page.
2. **Confirming bookings**: Go to Bookings → Find a pending booking → Click the green checkmark to confirm. The customer will receive a confirmation email.
3. **Sending forms**: Go to Forms → Create a template → Click "Send" → Enter the client's email.
4. **Managing inventory**: Go to Inventory → Add items → Set low stock thresholds → You'll get alerts on the Dashboard.
5. **Inviting team members**: Go to Team → Click "Invite Member" → Enter their email and set permissions.
6. **Setting up email**: Go to Settings → Integrations → Configure SMTP settings (host, port, username, password).

## Guidelines
- Be concise and friendly.
- When giving navigation instructions, mention the exact page name and sidebar link.
- If a user asks something unrelated to the platform, politely redirect them.
- Always suggest the specific page and button clicks needed to accomplish a task.
- Use emojis sparingly to keep answers approachable.`;

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
        });

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
