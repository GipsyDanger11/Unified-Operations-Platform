import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import { requirePermission } from '../middleware/roleCheck.js';
import Conversation from '../models/Conversation.js';
import { sendEmail } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';
import { emitAutomationEvent } from '../services/automationEngine.js';

const router = express.Router();

// Get all conversations
router.get('/', authenticate, checkWorkspaceActive, requirePermission('inbox'), async (req, res) => {
    try {
        const { status } = req.query;

        const query = { workspace: req.user.workspace };
        if (status) {
            query.status = status;
        }

        const conversations = await Conversation.find(query)
            .populate('contact')
            .sort({ lastMessageAt: -1 })
            .limit(50);

        res.json({ conversations });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get single conversation
router.get('/:id', authenticate, checkWorkspaceActive, requirePermission('inbox'), async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            workspace: req.user.workspace,
        }).populate('contact');

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Mark as read
        conversation.unreadCount = 0;
        await conversation.save();

        res.json({ conversation });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// Send message (staff reply)
router.post('/:id/messages', authenticate, checkWorkspaceActive, requirePermission('inbox'), async (req, res) => {
    try {
        const { content, channel } = req.body;

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            workspace: req.user.workspace,
        }).populate('contact');

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Add message to conversation
        conversation.messages.push({
            sender: 'staff',
            senderUser: req.user.id,
            content,
            channel: channel || 'internal',
            sentAt: new Date(),
            deliveryStatus: 'pending',
        });

        conversation.lastMessage = content.substring(0, 100);
        conversation.lastMessageAt = new Date();

        // Pause automation when staff replies
        if (!conversation.automationPaused) {
            conversation.automationPaused = true;
            conversation.pausedAt = new Date();
            conversation.pausedBy = req.user.id;

            emitAutomationEvent('staff_reply', { conversation });
        }

        await conversation.save();

        // Send via selected channel
        if (channel === 'email' && conversation.contact.email) {
            const replyLink = `http://localhost:5173/view-message/${conversation._id}`;
            const emailContent = `${content}\n\nTo reply, please visit: ${replyLink}`;
            const emailHtml = `<p>${content}</p><br/><hr/><p>To reply, please <a href="${replyLink}">click here</a>.</p>`;

            await sendEmail(
                req.user.workspace,
                conversation.contact.email,
                'Message from our team',
                emailHtml,
                emailContent
            );

            conversation.messages[conversation.messages.length - 1].deliveryStatus = 'sent';
            await conversation.save();
        } else if (channel === 'sms' && conversation.contact.phone) {
            await sendSMS(req.user.workspace, conversation.contact.phone, content);

            conversation.messages[conversation.messages.length - 1].deliveryStatus = 'sent';
            await conversation.save();
        }

        res.json({ message: 'Message sent', conversation });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
