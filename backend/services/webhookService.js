import crypto from 'crypto';
import mongoose from 'mongoose';

// Webhook model
const webhookSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    name: { type: String, required: true },
    url: { type: String, required: true },
    secret: { type: String, required: true }, // For signature verification

    // Events to trigger on
    events: [{
        type: String,
        enum: [
            'booking.created',
            'booking.updated',
            'booking.cancelled',
            'contact.created',
            'form.submitted',
            'inventory.low',
            'message.received',
        ],
    }],

    // Status
    isActive: { type: Boolean, default: true },

    // Retry configuration
    retryAttempts: { type: Number, default: 3 },
    retryDelay: { type: Number, default: 1000 }, // ms

    // Statistics
    totalCalls: { type: Number, default: 0 },
    successfulCalls: { type: Number, default: 0 },
    failedCalls: { type: Number, default: 0 },
    lastTriggered: Date,
    lastError: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

webhookSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Webhook = mongoose.model('Webhook', webhookSchema);

// Webhook delivery log
const webhookLogSchema = new mongoose.Schema({
    webhook: { type: mongoose.Schema.Types.ObjectId, ref: 'Webhook', required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    event: { type: String, required: true },
    payload: mongoose.Schema.Types.Mixed,

    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    statusCode: Number,
    responseBody: String,
    errorMessage: String,

    attempts: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
});

const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);

// Webhook service
export const triggerWebhook = async (workspaceId, event, payload) => {
    try {
        // Find all active webhooks for this workspace and event
        const webhooks = await Webhook.find({
            workspace: workspaceId,
            events: event,
            isActive: true,
        });

        if (webhooks.length === 0) {
            console.log(`No webhooks configured for event: ${event}`);
            return { success: true, message: 'No webhooks to trigger' };
        }

        // Trigger all webhooks in parallel
        const results = await Promise.allSettled(
            webhooks.map(webhook => deliverWebhook(webhook, event, payload))
        );

        console.log(`✅ Triggered ${webhooks.length} webhook(s) for event: ${event}`);

        return {
            success: true,
            triggered: webhooks.length,
            results: results.map((r, i) => ({
                webhook: webhooks[i].name,
                status: r.status,
                value: r.value,
            })),
        };

    } catch (error) {
        console.error('❌ Webhook trigger error:', error.message);
        // Graceful failure - don't break the core flow
        return {
            success: false,
            error: error.message,
            gracefulFail: true,
        };
    }
};

const deliverWebhook = async (webhook, event, payload, attempt = 1) => {
    const log = await WebhookLog.create({
        webhook: webhook._id,
        workspace: webhook.workspace,
        event,
        payload,
        attempts: attempt,
    });

    try {
        // Create signature for verification
        const timestamp = Date.now();
        const signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(`${timestamp}.${JSON.stringify(payload)}`)
            .digest('hex');

        // Send webhook
        const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-Timestamp': timestamp.toString(),
                'X-Webhook-Event': event,
            },
            body: JSON.stringify(payload),
        });

        const responseBody = await response.text();

        // Update log
        log.status = response.ok ? 'success' : 'failed';
        log.statusCode = response.status;
        log.responseBody = responseBody.substring(0, 1000); // Limit size
        await log.save();

        // Update webhook stats
        webhook.totalCalls += 1;
        if (response.ok) {
            webhook.successfulCalls += 1;
        } else {
            webhook.failedCalls += 1;
            webhook.lastError = `HTTP ${response.status}: ${responseBody.substring(0, 200)}`;
        }
        webhook.lastTriggered = new Date();
        await webhook.save();

        if (!response.ok && attempt < webhook.retryAttempts) {
            // Retry with exponential backoff
            const delay = webhook.retryDelay * Math.pow(2, attempt - 1);
            console.log(`Retrying webhook ${webhook.name} in ${delay}ms (attempt ${attempt + 1})`);

            await new Promise(resolve => setTimeout(resolve, delay));
            return deliverWebhook(webhook, event, payload, attempt + 1);
        }

        return {
            success: response.ok,
            statusCode: response.status,
            attempts: attempt,
        };

    } catch (error) {
        console.error(`❌ Webhook delivery error (${webhook.name}):`, error.message);

        log.status = 'failed';
        log.errorMessage = error.message;
        await log.save();

        webhook.totalCalls += 1;
        webhook.failedCalls += 1;
        webhook.lastError = error.message;
        webhook.lastTriggered = new Date();
        await webhook.save();

        if (attempt < webhook.retryAttempts) {
            const delay = webhook.retryDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            return deliverWebhook(webhook, event, payload, attempt + 1);
        }

        return {
            success: false,
            error: error.message,
            attempts: attempt,
        };
    }
};

export const createWebhook = async (workspaceId, webhookData) => {
    try {
        // Generate secret for signature verification
        const secret = crypto.randomBytes(32).toString('hex');

        const webhook = await Webhook.create({
            workspace: workspaceId,
            name: webhookData.name,
            url: webhookData.url,
            secret,
            events: webhookData.events,
            retryAttempts: webhookData.retryAttempts || 3,
            retryDelay: webhookData.retryDelay || 1000,
        });

        return {
            success: true,
            webhook: {
                id: webhook._id,
                name: webhook.name,
                url: webhook.url,
                secret, // Return once so user can store it
                events: webhook.events,
            },
        };

    } catch (error) {
        console.error('Create webhook error:', error);
        return { success: false, error: error.message };
    }
};

export const testWebhook = async (webhookId) => {
    try {
        const webhook = await Webhook.findById(webhookId);

        if (!webhook) {
            return { success: false, error: 'Webhook not found' };
        }

        const testPayload = {
            event: 'webhook.test',
            timestamp: new Date().toISOString(),
            data: { message: 'This is a test webhook' },
        };

        const result = await deliverWebhook(webhook, 'webhook.test', testPayload);

        return {
            success: result.success,
            message: result.success ? 'Webhook test successful' : 'Webhook test failed',
            statusCode: result.statusCode,
            attempts: result.attempts,
        };

    } catch (error) {
        console.error('Test webhook error:', error);
        return { success: false, error: error.message };
    }
};

export { Webhook, WebhookLog };
