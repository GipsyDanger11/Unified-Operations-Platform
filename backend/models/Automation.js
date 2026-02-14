import mongoose from 'mongoose';

const automationSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    // Rule definition
    name: { type: String, required: true },
    description: String,

    // Trigger
    trigger: {
        type: String,
        enum: [
            'contact_created',
            'booking_created',
            'booking_reminder_24h',
            'form_pending_48h',
            'inventory_low',
            'inventory_critical',
            'staff_reply',
            'booking_confirmed',
            'booking_completed'
        ],
        required: true
    },

    // Action
    action: {
        type: String,
        enum: ['send_email', 'send_sms', 'create_alert', 'pause_automation'],
        required: true
    },

    // Message template
    template: {
        subject: String, // For email
        body: { type: String, required: true },
        channel: { type: String, enum: ['email', 'sms', 'both'], default: 'email' },
    },

    // Conditions
    conditions: mongoose.Schema.Types.Mixed,

    // Status
    isActive: { type: Boolean, default: true },

    // Statistics
    executionCount: { type: Number, default: 0 },
    lastExecuted: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Automation execution log
const automationLogSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    automation: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation', required: true },

    trigger: String,
    action: String,

    // References
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },

    // Result
    status: { type: String, enum: ['success', 'failed', 'skipped'], required: true },
    errorMessage: String,

    executedAt: { type: Date, default: Date.now },
});

automationSchema.index({ workspace: 1, trigger: 1, isActive: 1 });

automationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export const Automation = mongoose.model('Automation', automationSchema);
export const AutomationLog = mongoose.model('AutomationLog', automationLogSchema);
