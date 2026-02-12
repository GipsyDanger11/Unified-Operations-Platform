import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    // Contact information
    firstName: { type: String, required: true },
    lastName: String,
    email: { type: String, lowercase: true, trim: true },
    phone: String,

    // Source tracking
    source: { type: String, enum: ['contact_form', 'booking', 'manual'], default: 'contact_form' },

    // Status
    status: { type: String, enum: ['new', 'contacted', 'active', 'inactive'], default: 'new' },

    // Metadata
    notes: String,
    tags: [String],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

contactSchema.index({ workspace: 1, email: 1 });
contactSchema.index({ workspace: 1, phone: 1 });

contactSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Contact', contactSchema);
