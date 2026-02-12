import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roleCheck.js';
import Integration from '../models/Integration.js';
import { Webhook, triggerWebhook, createWebhook, testWebhook } from '../services/webhookService.js';
import { testCalendarConnection } from '../services/calendarService.js';
import { testStorageConnection } from '../services/storageService.js';

const router = express.Router();

// Get all integrations status
router.get('/', authenticate, async (req, res) => {
    try {
        let integration = await Integration.findOne({ workspace: req.user.workspace });

        if (!integration) {
            integration = await Integration.create({ workspace: req.user.workspace });
        }

        // Return status without sensitive data
        res.json({
            email: {
                isConfigured: integration.email.isConfigured,
                isActive: integration.email.isActive,
                provider: integration.email.provider,
                fromEmail: integration.email.fromEmail,
            },
            sms: {
                isConfigured: integration.sms.isConfigured,
                isActive: integration.sms.isActive,
                provider: integration.sms.provider,
            },
            calendar: {
                isConfigured: integration.calendar?.isConfigured || false,
                isActive: integration.calendar?.isActive || false,
                provider: integration.calendar?.provider || 'google',
            },
            storage: {
                isConfigured: integration.storage?.isConfigured || false,
                isActive: integration.storage?.isActive || false,
                provider: integration.storage?.provider || 's3',
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch integrations' });
    }
});

// Configure calendar integration
router.post('/calendar', authenticate, requireOwner, async (req, res) => {
    try {
        const { accessToken, refreshToken, calendarId } = req.body;

        // Test connection
        const test = await testCalendarConnection(accessToken, refreshToken);

        let integration = await Integration.findOne({ workspace: req.user.workspace });
        if (!integration) {
            integration = new Integration({ workspace: req.user.workspace });
        }

        integration.calendar = {
            provider: 'google',
            accessToken,
            refreshToken,
            calendarId: calendarId || 'primary',
            isConfigured: test.success,
            isActive: test.success,
            lastTested: new Date(),
            testStatus: test.success ? 'success' : test.error,
        };

        await integration.save();

        res.json({
            message: test.success ? 'Calendar configured successfully' : 'Calendar configuration failed',
            success: test.success,
            calendars: test.calendars,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to configure calendar' });
    }
});

// Configure storage integration
router.post('/storage', authenticate, requireOwner, async (req, res) => {
    try {
        const { accessKeyId, secretAccessKey, bucketName, region, endpoint } = req.body;

        // Test connection
        const test = await testStorageConnection({
            accessKeyId,
            secretAccessKey,
            bucketName,
            region,
            endpoint,
        });

        let integration = await Integration.findOne({ workspace: req.user.workspace });
        if (!integration) {
            integration = new Integration({ workspace: req.user.workspace });
        }

        integration.storage = {
            provider: 's3',
            accessKeyId,
            secretAccessKey,
            bucketName,
            region,
            endpoint,
            isConfigured: test.success,
            isActive: test.success,
            lastTested: new Date(),
            testStatus: test.success ? 'success' : test.error,
        };

        await integration.save();

        res.json({
            message: test.success ? 'Storage configured successfully' : 'Storage configuration failed',
            success: test.success,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to configure storage' });
    }
});

// Webhook management
router.get('/webhooks', authenticate, async (req, res) => {
    try {
        const webhooks = await Webhook.find({ workspace: req.user.workspace });

        res.json({
            webhooks: webhooks.map(w => ({
                id: w._id,
                name: w.name,
                url: w.url,
                events: w.events,
                isActive: w.isActive,
                totalCalls: w.totalCalls,
                successfulCalls: w.successfulCalls,
                failedCalls: w.failedCalls,
                lastTriggered: w.lastTriggered,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
});

router.post('/webhooks', authenticate, requireOwner, async (req, res) => {
    try {
        const { name, url, events, retryAttempts, retryDelay } = req.body;

        const result = await createWebhook(req.user.workspace, {
            name,
            url,
            events,
            retryAttempts,
            retryDelay,
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create webhook' });
    }
});

router.post('/webhooks/:id/test', authenticate, requireOwner, async (req, res) => {
    try {
        const result = await testWebhook(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to test webhook' });
    }
});

router.delete('/webhooks/:id', authenticate, requireOwner, async (req, res) => {
    try {
        await Webhook.findOneAndDelete({
            _id: req.params.id,
            workspace: req.user.workspace,
        });

        res.json({ message: 'Webhook deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete webhook' });
    }
});

export default router;
