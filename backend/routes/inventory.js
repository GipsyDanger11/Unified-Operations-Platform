import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import { requirePermission } from '../middleware/roleCheck.js';
import { Inventory, InventoryTransaction } from '../models/Inventory.js';
import { emitAutomationEvent } from '../services/automationEngine.js';

const router = express.Router();

// Get all inventory items
router.get('/', authenticate, checkWorkspaceActive, requirePermission('inventory'), async (req, res) => {
    try {
        const items = await Inventory.find({ workspace: req.user.workspace, isActive: true })
            .sort({ alertStatus: -1, name: 1 });

        res.json({ items });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Create inventory item
router.post('/', authenticate, checkWorkspaceActive, requirePermission('inventory'), async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            currentQuantity,
            unit,
            lowStockThreshold,
            criticalThreshold,
            usagePerBooking,
            linkedServiceTypes,
        } = req.body;

        const item = await Inventory.create({
            workspace: req.user.workspace,
            name,
            description,
            category,
            currentQuantity,
            unit,
            lowStockThreshold,
            criticalThreshold,
            usagePerBooking,
            linkedServiceTypes,
        });

        res.status(201).json({ message: 'Inventory item created', item });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create inventory item' });
    }
});

// Update inventory quantity
router.patch('/:id/quantity', authenticate, checkWorkspaceActive, requirePermission('inventory'), async (req, res) => {
    try {
        const { quantity, type, notes } = req.body; // type: 'restock' | 'usage' | 'adjustment'

        const item = await Inventory.findOne({
            _id: req.params.id,
            workspace: req.user.workspace,
        });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        const previousQuantity = item.currentQuantity;
        const newQuantity = type === 'restock'
            ? previousQuantity + quantity
            : previousQuantity - quantity;

        // Log transaction
        await InventoryTransaction.create({
            workspace: req.user.workspace,
            inventory: item._id,
            type,
            quantity,
            previousQuantity,
            newQuantity,
            performedBy: req.user.id,
            notes,
        });

        // Update item
        item.currentQuantity = newQuantity;
        if (type === 'restock') {
            item.lastRestocked = new Date();
        }
        await item.save();

        // Trigger alerts if needed
        if (item.alertStatus === 'critical') {
            emitAutomationEvent('inventory_critical', {
                workspaceId: req.user.workspace,
                inventory: item,
            });
        } else if (item.alertStatus === 'low') {
            emitAutomationEvent('inventory_low', {
                workspaceId: req.user.workspace,
                inventory: item,
            });
        }

        res.json({ message: 'Inventory updated', item });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update inventory' });
    }
});

// Get inventory alerts
router.get('/alerts', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const alerts = await Inventory.find({
            workspace: req.user.workspace,
            alertStatus: { $in: ['low', 'critical'] },
            isActive: true,
        }).sort({ alertStatus: -1 });

        res.json({ alerts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

export default router;
