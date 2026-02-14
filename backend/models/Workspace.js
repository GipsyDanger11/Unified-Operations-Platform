import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    businessType: { type: String, required: false }, // Specific industry/niche
    address: { type: mongoose.Schema.Types.Mixed },
    timezone: { type: String, required: true, default: 'UTC' },
    contactEmail: { type: String, required: true },
    contactPhone: String,

    // Onboarding tracking
    onboardingStep: { type: Number, default: 1, min: 1, max: 8 },
    isActive: { type: Boolean, default: true },

    // Owner reference
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Staff members
    staff: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permissions: {
            inbox: { type: Boolean, default: false },
            bookings: { type: Boolean, default: false },
            forms: { type: Boolean, default: false },
            inventory: { type: Boolean, default: false },
        },
        addedAt: { type: Date, default: Date.now },
    }],

    // Integration status
    integrations: {
        emailConfigured: { type: Boolean, default: false },
        smsConfigured: { type: Boolean, default: false },
    },

    // Configuration
    hasContactForm: { type: Boolean, default: false },
    hasBookingTypes: { type: Boolean, default: false },

    // Service Types (for Booking)
    serviceTypes: [{
        name: { type: String, required: true },
        duration: { type: Number, required: true }, // in minutes
        price: { type: Number, default: 0 },
        description: String,
        isActive: { type: Boolean, default: true },
    }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

workspaceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Workspace', workspaceSchema);
