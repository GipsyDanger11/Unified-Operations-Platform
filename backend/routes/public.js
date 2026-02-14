import express from 'express';
import Contact from '../models/Contact.js';
import Conversation from '../models/Conversation.js';
import { emitAutomationEvent } from '../services/automationEngine.js';

const router = express.Router();

// Middleware to validate workspace ID
const validateWorkspaceId = (req, res, next) => {
    const { workspaceId } = req.params;

    // Check if it's the specific "DEMO" string which triggers directory view on frontend
    if (workspaceId === 'DEMO') {
        return res.status(404).json({ error: 'Returning to directory', isDemo: true });
    }

    // Basic ObjectId validation
    if (!workspaceId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid workspace ID' });
    }
    next();
};

// Public route: Submit contact form (NO AUTH REQUIRED)
router.post('/submit/:workspaceId', validateWorkspaceId, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { firstName, lastName, email, phone, message } = req.body;

        // Create or find contact — only search by fields that have values
        const orConditions = [];
        if (email) orConditions.push({ email: email.toLowerCase() });
        if (phone) orConditions.push({ phone });

        let contact = null;
        if (orConditions.length > 0) {
            contact = await Contact.findOne({
                workspace: workspaceId,
                $or: orConditions,
            });
        }

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
            conversation.lastMessage = message;
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

// Public route: Get all active workspaces (Directory)
router.get('/workspaces', async (req, res) => {
    try {
        const Workspace = (await import('../models/Workspace.js')).default;
        const workspaces = await Workspace.find({ isActive: true })
            .select('businessName _id address timezone')
            .lean();

        res.json(workspaces);
    } catch (error) {
        console.error('Failed to fetch workspaces:', error);
        res.status(500).json({ error: 'Failed to load business directory' });
    }
});



// Public route: Get workspace services
router.get('/services/:workspaceId', validateWorkspaceId, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const Workspace = (await import('../models/Workspace.js')).default;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // Return only active services
        let services = workspace.serviceTypes?.filter(s => s.isActive) || [];

        // Fallback for workspaces with no services configured
        if (services.length === 0) {
            services = [{
                _id: 'default_service',
                name: 'General Consultation',
                duration: 60,
                price: 0,
                description: 'Standard appointment'
            }];
        }

        res.json({
            businessName: workspace.businessName,
            services
        });
    } catch (error) {
        console.error('Failed to fetch services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Public route: Get conversation history (Guest View)
router.get('/conversation/:id', async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('contact', 'firstName lastName')
            .populate({
                path: 'workspace',
                select: 'businessName'
            });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({
            conversation: {
                _id: conversation._id,
                workspace: conversation.workspace,
                contact: conversation.contact,
                messages: conversation.messages.map(m => ({
                    sender: m.sender,
                    content: m.content,
                    sentAt: m.sentAt,
                    channel: m.channel
                })),
                status: conversation.status
            }
        });
    } catch (error) {
        console.error('Failed to fetch public conversation:', error);
        res.status(500).json({ error: 'Failed to load conversation' });
    }
});

// Public route: Reply to conversation (Guest View)
router.post('/conversation/:id/reply', async (req, res) => {
    try {
        const { message } = req.body;
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (message) {
            conversation.messages.push({
                sender: 'contact',
                content: message,
                channel: 'internal',
                sentAt: new Date(),
            });
            conversation.lastMessage = message;
            conversation.lastMessageAt = new Date();
            conversation.unreadCount += 1;
            await conversation.save();

            // Trigger automation
            emitAutomationEvent('contact_replied', {
                workspaceId: conversation.workspace,
                conversation,
            });
        }

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Public reply error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
});

export default router;
