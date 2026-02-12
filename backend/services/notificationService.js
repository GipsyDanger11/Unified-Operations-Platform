import { sendEmail } from './emailService.js';
import { sendSMS } from './smsService.js';

export const sendNotification = async (workspaceId, contact, subject, message, channel = 'email') => {
    const results = { email: null, sms: null };

    try {
        if (channel === 'email' || channel === 'both') {
            if (contact.email) {
                results.email = await sendEmail(
                    workspaceId,
                    contact.email,
                    subject,
                    message,
                    message
                );
            }
        }

        if (channel === 'sms' || channel === 'both') {
            if (contact.phone) {
                results.sms = await sendSMS(workspaceId, contact.phone, message);
            }
        }

        return results;
    } catch (error) {
        console.error('Notification send error:', error);
        return { error: error.message };
    }
};

export const createSystemAlert = async (workspaceId, type, message, reference) => {
    // This would create an in-app alert/notification
    // For now, just log it
    console.log(`🔔 ALERT [${type}] for workspace ${workspaceId}: ${message}`);

    return {
        type,
        message,
        reference,
        createdAt: new Date(),
    };
};
