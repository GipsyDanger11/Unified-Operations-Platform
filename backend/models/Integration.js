import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    // Email configuration (Gmail SMTP)
    email: {
        provider: { type: String, default: 'gmail' },
        // Gmail SMTP Credentials
        smtpHost: { type: String, default: 'smtp.gmail.com' },
        smtpPort: { type: Number, default: 587 },
        smtpUser: String, // Gmail address
        smtpPassword: String, // Gmail App Password

        fromEmail: String,
        fromName: String,
        isConfigured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        lastTested: Date,
        testStatus: String,
    },

    // SMS configuration (Twilio)
    sms: {
        provider: { type: String, default: 'twilio' },
        accountSid: String,
        authToken: String,
        fromNumber: String,
        isConfigured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        lastTested: Date,
        testStatus: String,
    },

    // Calendar configuration (Google Calendar)
    calendar: {
        provider: { type: String, default: 'google' },
        accessToken: String,
        refreshToken: String,
        calendarId: String,
        isConfigured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        lastTested: Date,
        testStatus: String,
    },

    // File Storage configuration (AWS S3 / Compatible)
    storage: {
        provider: { type: String, default: 's3' },
        accessKeyId: String,
        secretAccessKey: String,
        bucketName: String,
        region: String,
        endpoint: String, // For S3-compatible services
        isConfigured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        lastTested: Date,
        testStatus: String,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

integrationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Integration', integrationSchema);
