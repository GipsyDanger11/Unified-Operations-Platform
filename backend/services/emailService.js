import Integration from '../models/Integration.js';

export const sendEmail = async (workspaceId, to, subject, htmlContent, textContent) => {
    try {
        // Get workspace integration settings
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration || !integration.email.isConfigured || !integration.email.isActive) {
            console.error('Email not configured for workspace:', workspaceId);
            return { success: false, error: 'Email not configured' };
        }

        // Check provider (support legacy SendGrid if needed, but prioritize EmailJS structure)
        if (integration.email.provider === 'sendgrid') {
            // ... legacy SendGrid code if we wanted to keep it, but user asked to MIGRATE.
            // So we assume EmailJS. 
            // If they still have sendgrid data but provider is 'emailjs' (default now), we use EmailJS.
        }

        const { serviceId, templateId, publicKey, privateKey, fromName } = integration.email;

        if (!serviceId || !templateId || !publicKey) {
            return { success: false, error: 'Missing EmailJS credentials' };
        }

        const templateParams = {
            to_email: to,
            from_name: fromName || "Unified Ops",
            subject: subject,
            message: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Plain text for simplicity/safety
            html_message: htmlContent, // In case template uses this
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                accessToken: privateKey, // Secure sending
                template_params: templateParams,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`EmailJS Error: ${response.status} ${errorText}`);
        }

        console.log(`✅ Email sent to ${to} via EmailJS`);
        return { success: true };

    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error: error.message };
    }
};

export const testEmailConnection = async (config, testTo) => {
    try {
        const { serviceId, templateId, publicKey, privateKey, fromName } = config;

        const templateParams = {
            to_email: testTo,
            from_name: fromName || "Unified Ops",
            subject: 'Test Email - Unified Operations Platform',
            message: 'This is a test email to verify your EmailJS configuration.',
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                accessToken: privateKey,
                template_params: templateParams,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`EmailJS Error: ${errorText}`);
        }

        return { success: true, message: 'Test email sent successfully' };

    } catch (error) {
        console.error('Email test failed:', error);
        return { success: false, error: error.message };
    }
};
