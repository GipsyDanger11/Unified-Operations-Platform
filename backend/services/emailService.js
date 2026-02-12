import sgMail from '@sendgrid/mail';
import Integration from '../models/Integration.js';

export const sendEmail = async (workspaceId, to, subject, htmlContent, textContent) => {
    try {
        // Get workspace integration settings
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration || !integration.email.isConfigured || !integration.email.isActive) {
            console.error('Email not configured for workspace:', workspaceId);
            return { success: false, error: 'Email not configured' };
        }

        // Configure SendGrid
        sgMail.setApiKey(integration.email.apiKey);

        const msg = {
            to,
            from: {
                email: integration.email.fromEmail,
                name: integration.email.fromName || 'Unified Operations',
            },
            subject,
            text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            html: htmlContent,
        };

        await sgMail.send(msg);

        console.log(`✅ Email sent to ${to}`);
        return { success: true };

    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error: error.message };
    }
};

export const testEmailConnection = async (apiKey, fromEmail, fromName, testTo) => {
    try {
        sgMail.setApiKey(apiKey);

        const msg = {
            to: testTo,
            from: {
                email: fromEmail,
                name: fromName || 'Unified Operations',
            },
            subject: 'Test Email - Unified Operations Platform',
            text: 'This is a test email to verify your email configuration.',
            html: '<p>This is a test email to verify your email configuration.</p>',
        };

        await sgMail.send(msg);
        return { success: true, message: 'Test email sent successfully' };

    } catch (error) {
        console.error('Email test failed:', error);
        return { success: false, error: error.message };
    }
};
