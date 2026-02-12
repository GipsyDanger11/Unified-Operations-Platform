import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },

    // Service details
    serviceType: { type: String, required: true },
    serviceName: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes

    // Scheduling
    dateTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // Location
    locationType: { type: String, enum: ['in-person', 'virtual', 'phone'], default: 'in-person' },
    location: String,

    // Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'no-show', 'cancelled'],
        default: 'pending'
    },

    // Forms
    formsRequired: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Form' }],
    formsSent: { type: Boolean, default: false },
    formsSentAt: Date,

    // Reminders
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: Date,

    // Confirmation
    confirmationSent: { type: Boolean, default: false },
    confirmationSentAt: Date,

    // Notes
    notes: String,
    staffNotes: String,

    // Assigned staff
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

bookingSchema.index({ workspace: 1, dateTime: 1 });
bookingSchema.index({ workspace: 1, status: 1 });
bookingSchema.index({ contact: 1, dateTime: -1 });

bookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Booking', bookingSchema);
