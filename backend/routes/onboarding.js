import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roleCheck.js';
import Workspace from '../models/Workspace.js';
import Integration from '../models/Integration.js';
import { Automation } from '../models/Automation.js';
import { testEmailConnection } from '../services/emailService.js';
import { testSMSConnection } from '../services/smsService.js';

const router = express.Router();

// Get current onboarding status
router.get('/status', authenticate, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.user.workspace);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        res.json({
            currentStep: workspace.onboardingStep,
            isActive: workspace.isActive,
            workspace: {
                businessName: workspace.businessName,
                address: workspace.address,
                timezone: workspace.timezone,
                contactEmail: workspace.contactEmail,
                integrations: workspace.integrations,
                hasContactForm: workspace.hasContactForm,
                hasBookingTypes: workspace.hasBookingTypes,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get onboarding status' });
    }
});

// Step 1: Update workspace details
router.post('/step1', authenticate, requireOwner, async (req, res) => {
    try {
        const { businessName, address, timezone, contactEmail, contactPhone } = req.body;

        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            {
                businessName,
                address,
                timezone,
                contactEmail,
                contactPhone,
                onboardingStep: Math.max(2, workspace?.onboardingStep || 1),
            },
            { new: true }
        );

        res.json({ message: 'Workspace details updated', workspace });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workspace' });
    }
});

// Step 2: Configure email & SMS
router.post('/step2', authenticate, requireOwner, async (req, res) => {
    try {
        const { email, sms } = req.body;

        let integration = await Integration.findOne({ workspace: req.user.workspace });

        if (!integration) {
            integration = new Integration({ workspace: req.user.workspace });
        }

        // Configure email if provided
        if (email) {
            // Test email connection
            const emailTest = await testEmailConnection(
                email.apiKey,
                email.fromEmail,
                email.fromName,
                email.fromEmail // Send test to same email
            );

            integration.email = {
                provider: 'sendgrid',
                apiKey: email.apiKey,
                fromEmail: email.fromEmail,
                fromName: email.fromName,
                isConfigured: emailTest.success,
                isActive: emailTest.success,
                lastTested: new Date(),
                testStatus: emailTest.success ? 'success' : emailTest.error,
            };
        }

        // Configure SMS if provided
        if (sms) {
            // Test SMS connection
            const smsTest = await testSMSConnection(
                sms.accountSid,
                sms.authToken,
                sms.fromNumber,
                sms.testNumber
            );

            integration.sms = {
                provider: 'twilio',
                accountSid: sms.accountSid,
                authToken: sms.authToken,
                fromNumber: sms.fromNumber,
                isConfigured: smsTest.success,
                isActive: smsTest.success,
                lastTested: new Date(),
                testStatus: smsTest.success ? 'success' : smsTest.error,
            };
        }

        await integration.save();

        // Update workspace
        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            {
                'integrations.emailConfigured': integration.email.isConfigured,
                'integrations.smsConfigured': integration.sms.isConfigured,
                onboardingStep: Math.max(3, workspace?.onboardingStep || 2),
            },
            { new: true }
        );

        res.json({
            message: 'Communication channels configured',
            integration: {
                email: {
                    isConfigured: integration.email.isConfigured,
                    testStatus: integration.email.testStatus,
                },
                sms: {
                    isConfigured: integration.sms.isConfigured,
                    testStatus: integration.sms.testStatus,
                },
            },
        });
    } catch (error) {
        console.error('Step 2 error:', error);
        res.status(500).json({ error: 'Failed to configure communications' });
    }
});

// Step 3: Create contact form (mark as configured)
router.post('/step3', authenticate, requireOwner, async (req, res) => {
    try {
        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            {
                hasContactForm: true,
                onboardingStep: Math.max(4, workspace?.onboardingStep || 3),
            },
            { new: true }
        );

        // Create default "welcome" automation
        await Automation.create({
            workspace: req.user.workspace,
            name: 'Welcome New Contacts',
            description: 'Send welcome message to new contacts',
            trigger: 'contact_created',
            action: 'send_email',
            template: {
                subject: 'Welcome to {{businessName}}',
                body: 'Hi {{firstName}},\n\nThank you for reaching out! We\'ll get back to you shortly.\n\nBest regards,\nThe Team',
                channel: 'email',
            },
            isActive: true,
        });

        res.json({ message: 'Contact form configured', workspace });
    } catch (error) {
        res.status(500).json({ error: 'Failed to configure contact form' });
    }
});

// Step 4: Set up booking types (mark as configured)
router.post('/step4', authenticate, requireOwner, async (req, res) => {
    try {
        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            {
                hasBookingTypes: true,
                onboardingStep: Math.max(5, workspace?.onboardingStep || 4),
            },
            { new: true }
        );

        // Create default booking confirmation automation
        await Automation.create({
            workspace: req.user.workspace,
            name: 'Booking Confirmation',
            description: 'Send confirmation when booking is created',
            trigger: 'booking_created',
            action: 'send_email',
            template: {
                subject: 'Booking Confirmed - {{serviceType}}',
                body: 'Hi {{firstName}},\n\nYour booking for {{serviceType}} on {{dateTime}} has been confirmed!\n\nWe look forward to seeing you.\n\nBest regards,\nThe Team',
                channel: 'email',
            },
            isActive: true,
        });

        // Create booking reminder automation
        await Automation.create({
            workspace: req.user.workspace,
            name: 'Booking Reminder',
            description: 'Send reminder 24h before booking',
            trigger: 'booking_reminder_24h',
            action: 'send_email',
            template: {
                subject: 'Reminder: {{serviceType}} Tomorrow',
                body: 'Hi {{firstName}},\n\nThis is a reminder about your appointment for {{serviceType}} tomorrow at {{dateTime}}.\n\nSee you soon!\n\nBest regards,\nThe Team',
                channel: 'email',
            },
            isActive: true,
        });

        res.json({ message: 'Booking types configured', workspace });
    } catch (error) {
        res.status(500).json({ error: 'Failed to configure bookings' });
    }
});

// Steps 5-7: Simple progression (forms, inventory, staff)
router.post('/step/:stepNumber', authenticate, requireOwner, async (req, res) => {
    try {
        const stepNumber = parseInt(req.params.stepNumber);

        if (stepNumber < 5 || stepNumber > 7) {
            return res.status(400).json({ error: 'Invalid step number' });
        }

        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            { onboardingStep: Math.max(stepNumber + 1, workspace?.onboardingStep || stepNumber) },
            { new: true }
        );

        res.json({ message: `Step ${stepNumber} completed`, workspace });
    } catch (error) {
        res.status(500).json({ error: `Failed to complete step ${req.params.stepNumber}` });
    }
});

// Step 8: Activate workspace
router.post('/activate', authenticate, requireOwner, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.user.workspace);

        // Verify requirements
        const integration = await Integration.findOne({ workspace: req.user.workspace });

        if (!integration || (!integration.email.isConfigured && !integration.sms.isConfigured)) {
            return res.status(400).json({
                error: 'At least one communication channel must be configured'
            });
        }

        if (!workspace.hasBookingTypes) {
            return res.status(400).json({
                error: 'At least one booking type must be configured'
            });
        }

        // Activate workspace
        workspace.isActive = true;
        workspace.onboardingStep = 8;
        await workspace.save();

        res.json({
            message: 'Workspace activated successfully!',
            workspace: {
                id: workspace._id,
                businessName: workspace.businessName,
                isActive: workspace.isActive,
            },
        });
    } catch (error) {
        console.error('Activation error:', error);
        res.status(500).json({ error: 'Failed to activate workspace' });
    }
});

export default router;
