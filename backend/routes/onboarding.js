import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roleCheck.js';
import Workspace from '../models/Workspace.js';
import Integration from '../models/Integration.js';
import { Automation } from '../models/Automation.js';
import { testEmailConnection } from '../services/emailService.js';


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
        console.log('Step 1 update request:', req.body);
        const { businessName, address, timezone, contactEmail, contactPhone } = req.body;

        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            {
                $set: {
                    businessName,
                    address,
                    timezone,
                    contactEmail,
                    contactPhone,
                },
                $max: { onboardingStep: 2 },
            },
            { new: true }
        );

        res.json({ message: 'Workspace details updated', workspace });
    } catch (error) {
        console.error('Step 1 update error:', error);
        res.status(500).json({ error: 'Failed to update workspace', details: error.message });
    }
});

// Step 2: Configure email & SMS
router.post('/step2', authenticate, requireOwner, async (req, res) => {
    try {
        const { email } = req.body;

        let integration = await Integration.findOne({ workspace: req.user.workspace });

        if (!integration) {
            integration = new Integration({ workspace: req.user.workspace });
        }

        // Configure email if provided
        if (email) {
            const emailConfig = {
                serviceId: email.serviceId,
                templateId: email.templateId,
                publicKey: email.publicKey,
                privateKey: email.privateKey, // Optional
                fromName: email.fromName || 'Unified Ops'
            };

            // Test email connection (if we have minimum creds)
            let emailTest = { success: false };
            if (email.serviceId && email.publicKey) {
                try {
                    const workspaceData = await Workspace.findById(req.user.workspace);
                    // Fallback if workspace not found or contactEmail missing
                    const testTo = (workspaceData && workspaceData.contactEmail) ? workspaceData.contactEmail : 'test@example.com';

                    console.log('Testing email connection to:', testTo);
                    emailTest = await testEmailConnection(emailConfig, testTo);
                    console.log('Email test result:', emailTest);
                } catch (testErr) {
                    console.error('Email test wrapper error:', testErr);
                    emailTest = { success: false, error: testErr.message };
                }
            }

            integration.email = {
                provider: 'emailjs',
                serviceId: email.serviceId,
                templateId: email.templateId,
                publicKey: email.publicKey,
                privateKey: email.privateKey,
                fromName: email.fromName,
                isConfigured: emailTest.success,
                isActive: emailTest.success,
                lastTested: new Date(),
                testStatus: emailTest.success ? 'success' : emailTest.error,
            };
        }

        await integration.save();

        // Update workspace
        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            {
                $set: {
                    'integrations.emailConfigured': integration.email.isConfigured,
                    // SMS config removed
                },
                $max: { onboardingStep: 3 },
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
                $set: { hasContactForm: true },
                $max: { onboardingStep: 4 },
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
                $set: { hasBookingTypes: true },
                $max: { onboardingStep: 5 },
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

// Step 5: Forms (Create User Form)
router.post('/step/5', authenticate, requireOwner, async (req, res) => {
    try {
        const { formName, formType, formFields } = req.body;

        if (formName) {
            const { Form } = await import('../models/Form.js');

            // Build fields array from checkboxes
            const fields = [];
            if (formFields?.includeName) fields.push({ label: 'Full Name', type: 'text', required: true });
            if (formFields?.includeEmail) fields.push({ label: 'Email', type: 'email', required: true });
            if (formFields?.includePhone) fields.push({ label: 'Phone', type: 'phone', required: false });
            if (formFields?.includeNotes) fields.push({ label: 'Notes', type: 'textarea', required: false });

            // Create form
            await Form.create({
                workspace: req.user.workspace,
                name: formName,
                type: formType || 'intake',
                fields: fields,
                isActive: true
            });
        }

        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            { $max: { onboardingStep: 6 } },
            { new: true }
        );
        res.json({ message: 'Form configured', workspace });
    } catch (error) {
        console.error('Step 5 error:', error);
        res.status(500).json({ error: 'Failed to complete step 5' });
    }
});

// Step 6: Inventory
router.post('/step/6', authenticate, requireOwner, async (req, res) => {
    try {
        const { inventoryName, inventoryQuantity, inventoryUnit, inventoryThreshold } = req.body;

        if (inventoryName) {
            // Import Inventory model dynamically or use global if available. 
            // Better to import at top, but for now we assume it's available or update imports.
            // Wait, we need to import it at the top of the file!
            // I'll update the top imports in a separate Edit if needed, but let's assume I did/will.
            /* 
               Actually, I can't assume. I should check imports. 
               File view showed headers. I need to add imports.
            */
            // Placeholder for saving if model not imported.
            // However, to do this right, I will Add imports in a separate tool call or check if I can do it here.
            // I cannot edit non-contiguous lines easily.
            // I will use multi-replace or just assume "Inventory" is valid if I add imports.
        }

        // For now, let's just update the step, but ideally valid save.
        // Assuming imports will be added.
        const { Inventory } = await import('../models/Inventory.js');

        if (inventoryName) {
            await Inventory.create({
                workspace: req.user.workspace,
                name: inventoryName,
                currentQuantity: parseInt(inventoryQuantity) || 0,
                unit: inventoryUnit || 'units',
                lowStockThreshold: parseInt(inventoryThreshold) || 5,
                criticalThreshold: 2,
            });
        }

        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            { $max: { onboardingStep: 7 } },
            { new: true }
        );
        res.json({ message: 'Inventory configured', workspace });
    } catch (error) {
        console.error('Step 6 error:', error);
        res.status(500).json({ error: 'Failed to configure inventory' });
    }
});

// Step 7: Staff
router.post('/step/7', authenticate, requireOwner, async (req, res) => {
    try {
        const { staffEmail, staffFirstName, staffLastName, staffRole, staffPermissions } = req.body;

        if (staffEmail) {
            // Create user or invite logic
            // Ideally use User model.
            const User = (await import('../models/User.js')).default;

            // Check if user exists
            let existingUser = await User.findOne({ email: staffEmail });

            if (!existingUser) {
                // Create pending user (password reset flow usually)
                // Or just create active for now with dummy password
                await User.create({
                    email: staffEmail,
                    firstName: staffFirstName,
                    lastName: staffLastName,
                    password: 'tempPassword123!', // In real app, send invite email
                    role: staffRole || 'staff',
                    workspace: req.user.workspace,
                    permissions: staffPermissions || {},
                });
                // TODO: Send invitation email
            }
        }

        const workspace = await Workspace.findByIdAndUpdate(
            req.user.workspace,
            { $max: { onboardingStep: 8 } },
            { new: true }
        );
        res.json({ message: 'Staff invited', workspace });
    } catch (error) {
        console.error('Step 7 error:', error);
        res.status(500).json({ error: 'Failed to invite staff' });
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
