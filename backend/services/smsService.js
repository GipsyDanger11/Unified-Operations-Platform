import twilio from 'twilio';
import Integration from '../models/Integration.js';

export const sendSMS = async (workspaceId, to, message) => {
    try {
        // Get workspace integration settings
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration || !integration.sms.isConfigured || !integration.sms.isActive) {
            console.error('SMS not configured for workspace:', workspaceId);
            return { success: false, error: 'SMS not configured' };
        }

        // Initialize Twilio client
        const client = twilio(integration.sms.accountSid, integration.sms.authToken);

        const result = await client.messages.create({
            body: message,
            from: integration.sms.fromNumber,
            to: to,
        });

        console.log(`✅ SMS sent to ${to}, SID: ${result.sid}`);
        return { success: true, sid: result.sid };

    } catch (error) {
        console.error('❌ SMS send error:', error);
        return { success: false, error: error.message };
    }
};

export const testSMSConnection = async (accountSid, authToken, fromNumber, testTo) => {
    try {
        const client = twilio(accountSid, authToken);

        const result = await client.messages.create({
            body: 'Test message from Unified Operations Platform',
            from: fromNumber,
            to: testTo,
        });

        return { success: true, message: 'Test SMS sent successfully', sid: result.sid };

    } catch (error) {
        console.error('SMS test failed:', error);
        return { success: false, error: error.message };
    }
};
