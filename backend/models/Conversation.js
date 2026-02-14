import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },

    // Messages
    messages: [{
        sender: { type: String, enum: ['contact', 'staff', 'system'], required: true },
        senderUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If staff sent
        content: { type: String, required: true },
        channel: { type: String, enum: ['email', 'sms', 'internal'], default: 'internal' },
        sentAt: { type: Date, default: Date.now },
        deliveryStatus: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'sent' },
    }],

    // Status
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    unreadCount: { type: Number, default: 0 },

    // Automation control
    automationPaused: { type: Boolean, default: false },
    pausedAt: Date,
    pausedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    lastMessage: { type: String }, // Cached preview of the last message
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

conversationSchema.index({ workspace: 1, contact: 1 });
conversationSchema.index({ workspace: 1, status: 1, lastMessageAt: -1 });

conversationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Conversation', conversationSchema);
