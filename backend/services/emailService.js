import Integration from '../models/Integration.js';
import nodemailer from 'nodemailer';

export const sendEmail = async (workspaceId, to, subject, htmlContent, textContent) => {
    console.log(`📧 Attempting to send email to: ${to} (Subject: ${subject})`);
    try {
        // Get workspace integration settings
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration || !integration.email.isConfigured || !integration.email.isActive) {
            console.error('Email not configured for workspace:', workspaceId);
            return { success: false, error: 'Email not configured' };
        }

        const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName } = integration.email;

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
            return { success: false, error: 'Missing Gmail SMTP credentials' };
        }

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });

        // Email options
        const mailOptions = {
            from: `"${fromName || 'Unified Ops'}" <${fromEmail || smtpUser}>`,
            to: to,
            subject: subject,
            text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Plain text fallback
            html: htmlContent,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email sent to ${to} via Gmail SMTP - Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error: error.message };
    }
};

export const testEmailConnection = async (config, testTo) => {
    try {
        const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName } = config;

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
            return { success: false, error: 'Missing Gmail SMTP credentials' };
        }

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });

        // Verify connection
        await transporter.verify();

        // Send test email
        const mailOptions = {
            from: `"${fromName || 'Unified Ops'}" <${fromEmail || smtpUser}>`,
            to: testTo,
            subject: 'Test Email - Unified Operations Platform',
            text: 'This is a test email to verify your Gmail SMTP configuration.',
            html: '<p>This is a test email to verify your <strong>Gmail SMTP</strong> configuration.</p>',
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Test email sent successfully - Message ID: ${info.messageId}`);
        return { success: true, message: 'Test email sent successfully', messageId: info.messageId };

    } catch (error) {
        console.error('Email test failed:', error);
        return { success: false, error: error.message };
    }
};
