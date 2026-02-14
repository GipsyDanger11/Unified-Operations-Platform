import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import Booking from '../models/Booking.js';
import Contact from '../models/Contact.js';
import Conversation from '../models/Conversation.js';
import { FormSubmission } from '../models/Form.js';
import { Inventory } from '../models/Inventory.js';
import User from '../models/User.js';

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

        // Refresh user to get latest dismissed alerts
        // const user = await User.findById(req.user.id);
        // optimization: req.user is already populated by authenticate middleware, 
        // but let's make sure we have the dismissedAlerts field if it was just added schema-wise
        // The authenticate middleware likely fetches the user. 
        // Let's assume req.user has it or fetch if deeply nested needed.
        // Actually, let's fetch strictly the dismissedAlerts to be safe.
        // const userContext = await User.findById(req.user.id).select('dismissedAlerts');
        const dismissedIds = req.user.dismissedAlerts ? req.user.dismissedAlerts.map(a => a.id) : [];

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

        const bookingAlertId = `booking-pending-${today.toISOString().split('T')[0]}`;
        if (unconfirmedBookings > 0 && !dismissedIds.includes(bookingAlertId)) {
            alerts.push({
                id: bookingAlertId,
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
            const alertId = `inventory-critical-${item._id}`;
            if (!dismissedIds.includes(alertId)) {
                alerts.push({
                    id: alertId,
                    type: 'error',
                    message: `Critical: ${item.name} (${item.currentQuantity} ${item.unit})`,
                    link: '/inventory',
                });
            }
        });

        // Overdue forms
        const overdueForms = await FormSubmission.countDocuments({
            workspace: workspaceId,
            status: 'overdue',
        });

        const overdueFormAlertId = `forms-overdue-${today.toISOString().split('T')[0]}`;
        if (overdueForms > 0 && !dismissedIds.includes(overdueFormAlertId)) {
            alerts.push({
                id: overdueFormAlertId,
                type: 'info',
                message: `${overdueForms} form${overdueForms > 1 ? 's' : ''} overdue`,
                link: '/forms?status=overdue',
            });
        }

        res.json({ alerts });
    } catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Dismiss alert
router.post('/alerts/:id/dismiss', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch full user document as req.user only contains token payload
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize if undefined (though schema default should handle this)
        if (!user.dismissedAlerts) {
            user.dismissedAlerts = [];
        }

        // Check if already dismissed
        if (user.dismissedAlerts.some(a => a.id === id)) {
            return res.json({ message: 'Alert already dismissed' });
        }

        user.dismissedAlerts.push({
            id,
            dismissedAt: new Date()
        });

        await user.save();
        res.json({ message: 'Alert dismissed' });
    } catch (error) {
        console.error('Dismiss alert error:', error);
        res.status(500).json({ error: 'Failed to dismiss alert' });
    }
});

export default router;
