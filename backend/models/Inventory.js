import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    // Item details
    name: { type: String, required: true },
    description: String,
    category: String,

    // Quantity tracking
    currentQuantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'units' }, // units, liters, kg, etc.

    // Thresholds
    lowStockThreshold: { type: Number, required: true },
    criticalThreshold: { type: Number, required: true },

    // Usage per booking
    usagePerBooking: { type: Number, default: 0 },
    linkedServiceTypes: [String],

    // Alerts
    alertStatus: {
        type: String,
        enum: ['normal', 'low', 'critical'],
        default: 'normal'
    },
    lastAlertSent: Date,

    // Tracking
    lastRestocked: Date,
    reorderPoint: Number,
    supplier: String,

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Inventory transaction log
const inventoryTransactionSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },

    type: { type: String, enum: ['restock', 'usage', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },

    // Reference
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    notes: String,
    createdAt: { type: Date, default: Date.now },
});

inventorySchema.index({ workspace: 1, alertStatus: 1 });

inventorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Update alert status based on quantity
    if (this.currentQuantity <= this.criticalThreshold) {
        this.alertStatus = 'critical';
    } else if (this.currentQuantity <= this.lowStockThreshold) {
        this.alertStatus = 'low';
    } else {
        this.alertStatus = 'normal';
    }

    next();
});

export const Inventory = mongoose.model('Inventory', inventorySchema);
export const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
