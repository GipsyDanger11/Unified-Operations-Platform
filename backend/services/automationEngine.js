import { Automation, AutomationLog } from '../models/Automation.js';
import Booking from '../models/Booking.js';
import { FormSubmission } from '../models/Form.js';
import { Inventory } from '../models/Inventory.js';
import Conversation from '../models/Conversation.js';
import { sendEmail } from './emailService.js';
import { sendSMS } from './smsService.js';
import { createSystemAlert } from './notificationService.js';

// Event emitter for real-time automation
import { EventEmitter } from 'events';
const automationEvents = new EventEmitter();

// Start the automation engine
export const startAutomationEngine = () => {
    console.log('🤖 Automation Engine started');

    // Check for scheduled automations every minute
    setInterval(checkScheduledAutomations, 60000);

    // Listen for real-time events
    setupEventListeners();
};

// Emit automation events
export const emitAutomationEvent = (trigger, data) => {
    automationEvents.emit(trigger, data);
};

// Setup event listeners
const setupEventListeners = () => {
    automationEvents.on('contact_created', handleContactCreated);
    automationEvents.on('booking_created', handleBookingCreated);
    automationEvents.on('staff_reply', handleStaffReply);
    automationEvents.on('inventory_low', handleInventoryLow);
    automationEvents.on('inventory_critical', handleInventoryCritical);
};

// Handler: New contact created
const handleContactCreated = async (data) => {
    const { workspaceId, contact, conversation } = data;

    try {
        const automations = await Automation.find({
            workspace: workspaceId,
            trigger: 'contact_created',
            isActive: true,
        });

        for (const automation of automations) {
            await executeAutomation(automation, { contact, conversation });
        }
    } catch (error) {
        console.error('Error handling contact_created:', error);
    }
};

// Handler: Booking created
const handleBookingCreated = async (data) => {
    const { workspaceId, booking, contact } = data;

    try {
        const automations = await Automation.find({
            workspace: workspaceId,
            trigger: 'booking_created',
            isActive: true,
        });

        for (const automation of automations) {
            await executeAutomation(automation, { booking, contact });
        }
    } catch (error) {
        console.error('Error handling booking_created:', error);
    }
};

// Handler: Staff reply (pause automation)
const handleStaffReply = async (data) => {
    const { conversation } = data;

    try {
        // Pause automation for this conversation
        conversation.automationPaused = true;
        conversation.pausedAt = new Date();
        await conversation.save();

        console.log(`⏸️ Automation paused for conversation ${conversation._id}`);
    } catch (error) {
        console.error('Error handling staff_reply:', error);
    }
};

// Handler: Inventory low
const handleInventoryLow = async (data) => {
    const { workspaceId, inventory } = data;

    try {
        await createSystemAlert(
            workspaceId,
            'inventory_low',
            `Low stock: ${inventory.name} (${inventory.currentQuantity} ${inventory.unit})`,
            { inventoryId: inventory._id }
        );
    } catch (error) {
        console.error('Error handling inventory_low:', error);
    }
};

// Handler: Inventory critical
const handleInventoryCritical = async (data) => {
    const { workspaceId, inventory } = data;

    try {
        await createSystemAlert(
            workspaceId,
            'inventory_critical',
            `CRITICAL: ${inventory.name} (${inventory.currentQuantity} ${inventory.unit})`,
            { inventoryId: inventory._id }
        );
    } catch (error) {
        console.error('Error handling inventory_critical:', error);
    }
};

// Check for scheduled automations (reminders, overdue forms, etc.)
const checkScheduledAutomations = async () => {
    try {
        // Check for booking reminders (24h before)
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 24);

        const bookingsNeedingReminder = await Booking.find({
            dateTime: { $lte: tomorrow, $gte: new Date() },
            reminderSent: false,
            status: { $in: ['pending', 'confirmed'] },
        }).populate('contact workspace');

        for (const booking of bookingsNeedingReminder) {
            const automations = await Automation.find({
                workspace: booking.workspace._id,
                trigger: 'booking_reminder_24h',
                isActive: true,
            });

            for (const automation of automations) {
                await executeAutomation(automation, { booking, contact: booking.contact });
            }

            booking.reminderSent = true;
            booking.reminderSentAt = new Date();
            await booking.save();
        }

        // Check for overdue forms (48h pending)
        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

        const overdueFormSubmissions = await FormSubmission.find({
            status: 'pending',
            sentAt: { $lte: twoDaysAgo },
            reminderSent: false,
        }).populate('contact workspace form');

        for (const submission of overdueFormSubmissions) {
            const automations = await Automation.find({
                workspace: submission.workspace._id,
                trigger: 'form_pending_48h',
                isActive: true,
            });

            for (const automation of automations) {
                await executeAutomation(automation, { formSubmission: submission, contact: submission.contact });
            }

            submission.reminderSent = true;
            submission.reminderSentAt = new Date();
            submission.reminderCount += 1;
            await submission.save();
        }

    } catch (error) {
        console.error('Error in checkScheduledAutomations:', error);
    }
};

// Execute an automation
const executeAutomation = async (automation, context) => {
    try {
        const { action, template } = automation;
        const { contact, booking, conversation, formSubmission } = context;

        let result = { status: 'success' };

        // Replace template variables
        let message = template.body;
        if (contact) {
            message = message.replace('{{firstName}}', contact.firstName || '');
            message = message.replace('{{lastName}}', contact.lastName || '');
        }
        if (booking) {
            message = message.replace('{{serviceType}}', booking.serviceName || '');
            message = message.replace('{{dateTime}}', booking.dateTime?.toLocaleString() || '');

            // Generate form link if booking is present
            // In a real app, we'd lookup specific forms linked to this service type
            // For hackathon, we'll link to a hypothetical generic intake form or the workspace's contact form
            const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
            // We use a placeholder ID or logic to find the right form. 
            // Since we don't have an easy way to get "the" form without a query, 
            // we will point to the contact page as a fallback or a specific form if the template has an ID.
            // A better approach for Flow B is to assume the template contains the link, OR we provide a variable 
            // that links to a "pending forms" page. 
            // For now, let's allow {{portalLink}} to the contact page which is safe.
            const portalLink = `${baseUrl}/contact?workspace=${automation.workspace}`;
            message = message.replace('{{portalLink}}', portalLink);

            // If we really want {{formLink}}, we'd need a formId. 
            // Let's assume the user puts the ID in the template or we pick the first intake form.
        }

        // Generic replacements
        const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
        message = message.replace('{{workspaceLink}}', `${baseUrl}/contact?workspace=${automation.workspace}`);

        // Execute action
        switch (action) {
            case 'send_email':
                if (contact?.email) {
                    result = await sendEmail(
                        automation.workspace,
                        contact.email,
                        template.subject || 'Notification',
                        message,
                        message
                    );
                }
                break;

            case 'send_sms':
                if (contact?.phone) {
                    result = await sendSMS(automation.workspace, contact.phone, message);
                }
                break;

            case 'create_alert':
                result = await createSystemAlert(
                    automation.workspace,
                    automation.trigger,
                    message,
                    context
                );
                break;

            case 'pause_automation':
                if (conversation) {
                    conversation.automationPaused = true;
                    conversation.pausedAt = new Date();
                    await conversation.save();
                }
                break;
        }

        // Log execution
        await AutomationLog.create({
            workspace: automation.workspace,
            automation: automation._id,
            trigger: automation.trigger,
            action: automation.action,
            contact: contact?._id,
            booking: booking?._id,
            conversation: conversation?._id,
            status: result.success !== false ? 'success' : 'failed',
            errorMessage: result.error,
        });

        // Update automation stats
        automation.executionCount += 1;
        automation.lastExecuted = new Date();
        await automation.save();

        console.log(`✅ Automation executed: ${automation.name}`);

    } catch (error) {
        console.error('Error executing automation:', error);

        await AutomationLog.create({
            workspace: automation.workspace,
            automation: automation._id,
            trigger: automation.trigger,
            action: automation.action,
            status: 'failed',
            errorMessage: error.message,
        });
    }
};
