import express from 'express';
import Contact from '../models/Contact.js';
import Conversation from '../models/Conversation.js';
import { emitAutomationEvent } from '../services/automationEngine.js';

const router = express.Router();

// Public route: Submit contact form (NO AUTH REQUIRED)
router.post('/submit/:workspaceId', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { firstName, lastName, email, phone, message } = req.body;

        // Create or find contact
        let contact = await Contact.findOne({
            workspace: workspaceId,
            $or: [
                { email: email?.toLowerCase() },
                { phone },
            ],
        });

        if (!contact) {
            contact = await Contact.create({
                workspace: workspaceId,
                firstName,
                lastName,
                email,
                phone,
                source: 'contact_form',
                status: 'new',
            });
        }

        // Create or find conversation
        let conversation = await Conversation.findOne({
            workspace: workspaceId,
            contact: contact._id,
        });

        if (!conversation) {
            conversation = await Conversation.create({
                workspace: workspaceId,
                contact: contact._id,
                messages: [],
            });
        }

        // Add message if provided
        if (message) {
            conversation.messages.push({
                sender: 'contact',
                content: message,
                channel: 'internal',
                sentAt: new Date(),
            });
            conversation.lastMessageAt = new Date();
            conversation.unreadCount += 1;
            await conversation.save();
        }

        // Trigger automation
        emitAutomationEvent('contact_created', {
            workspaceId,
            contact,
            conversation,
        });

        res.status(201).json({
            message: 'Thank you for contacting us! We\'ll be in touch soon.',
            success: true,
        });
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

export default router;
