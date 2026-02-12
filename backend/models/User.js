import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    permissions: {
        inbox: { type: Boolean, default: false },
        bookings: { type: Boolean, default: false },
        forms: { type: Boolean, default: false },
        inventory: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('User', userSchema);
