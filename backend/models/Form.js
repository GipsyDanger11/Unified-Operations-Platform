import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    // Template information
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['intake', 'agreement', 'custom'], default: 'custom' },

    // Form fields
    fields: [{
        label: { type: String, required: true },
        type: { type: String, enum: ['text', 'email', 'phone', 'textarea', 'checkbox', 'select'], required: true },
        required: { type: Boolean, default: false },
        options: [String], // For select fields
        placeholder: String,
    }],

    // File upload (if form is a PDF/document)
    fileUrl: String,
    fileName: String,

    // Linked to booking types
    linkedToServiceTypes: [String],

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const formSubmissionSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

    // Submission data
    responses: mongoose.Schema.Types.Mixed,

    // Status
    status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' },
    completedAt: Date,

    // Reminders
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: Date,
    reminderCount: { type: Number, default: 0 },

    // Tracking
    sentAt: { type: Date, default: Date.now },
    dueDate: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

formSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

formSubmissionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Mark as overdue if past due date and not completed
    if (this.dueDate && this.dueDate < new Date() && this.status === 'pending') {
        this.status = 'overdue';
    }

    next();
});

export const Form = mongoose.model('Form', formSchema);
export const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);
