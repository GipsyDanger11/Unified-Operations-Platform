import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import Booking from '../models/Booking.js';
import Contact from '../models/Contact.js';
import Conversation from '../models/Conversation.js';
import { FormSubmission } from '../models/Form.js';
import { Inventory } from '../models/Inventory.js';

const router = express.Router();

// Get dashboard metrics
router.get('/metrics', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const workspaceId = req.user.workspace;

        // Today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's bookings
        const todaysBookings = await Booking.countDocuments({
            workspace: workspaceId,
            dateTime: { $gte: today, $lt: tomorrow },
        });

        // Upcoming bookings (next 7 days)
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingBookings = await Booking.countDocuments({
            workspace: workspaceId,
            dateTime: { $gte: tomorrow, $lt: nextWeek },
            status: { $in: ['pending', 'confirmed'] },
        });

        // Unread messages
        const unreadMessages = await Conversation.aggregate([
            { $match: { workspace: workspaceId, status: 'open' } },
            { $group: { _id: null, total: { $sum: '$unreadCount' } } },
        ]);

        // Pending forms
        const pendingForms = await FormSubmission.countDocuments({
            workspace: workspaceId,
            status: 'pending',
        });

        // Overdue forms
        const overdueForms = await FormSubmission.countDocuments({
            workspace: workspaceId,
            status: 'overdue',
        });

        // Low stock items
        const lowStockItems = await Inventory.countDocuments({
            workspace: workspaceId,
            alertStatus: { $in: ['low', 'critical'] },
            isActive: true,
        });

        // Critical inventory
        const criticalInventory = await Inventory.countDocuments({
            workspace: workspaceId,
            alertStatus: 'critical',
            isActive: true,
        });

        // New contacts (last 7 days)
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newContacts = await Contact.countDocuments({
            workspace: workspaceId,
            createdAt: { $gte: weekAgo },
        });

        res.json({
            bookings: {
                today: todaysBookings,
                upcoming: upcomingBookings,
            },
            messages: {
                unread: unreadMessages[0]?.total || 0,
            },
            forms: {
                pending: pendingForms,
                overdue: overdueForms,
            },
            inventory: {
                lowStock: lowStockItems,
                critical: criticalInventory,
            },
            contacts: {
                newThisWeek: newContacts,
            },
        });
    } catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});

// Get recent activity
router.get('/activity', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const workspaceId = req.user.workspace;

        // Get recent bookings
        const recentBookings = await Booking.find({ workspace: workspaceId })
            .populate('contact')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent conversations
        const recentConversations = await Conversation.find({ workspace: workspaceId })
            .populate('contact')
            .sort({ lastMessageAt: -1 })
            .limit(5);

        res.json({
            recentBookings,
            recentConversations,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Get alerts
router.get('/alerts', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const workspaceId = req.user.workspace;
        const alerts = [];

        // Unconfirmed bookings today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const unconfirmedBookings = await Booking.countDocuments({
            workspace: workspaceId,
            dateTime: { $gte: today, $lt: tomorrow },
            status: 'pending',
        });

        if (unconfirmedBookings > 0) {
            alerts.push({
                type: 'warning',
                message: `${unconfirmedBookings} unconfirmed booking${unconfirmedBookings > 1 ? 's' : ''} today`,
                link: '/bookings?status=pending',
            });
        }

        // Critical inventory
        const criticalItems = await Inventory.find({
            workspace: workspaceId,
            alertStatus: 'critical',
            isActive: true,
        }).limit(3);

        criticalItems.forEach(item => {
            alerts.push({
                type: 'error',
                message: `Critical: ${item.name} (${item.currentQuantity} ${item.unit})`,
                link: '/inventory',
            });
        });

        // Overdue forms
        const overdueForms = await FormSubmission.countDocuments({
            workspace: workspaceId,
            status: 'overdue',
        });

        if (overdueForms > 0) {
            alerts.push({
                type: 'info',
                message: `${overdueForms} form${overdueForms > 1 ? 's' : ''} overdue`,
                link: '/forms?status=overdue',
            });
        }

        res.json({ alerts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

export default router;
