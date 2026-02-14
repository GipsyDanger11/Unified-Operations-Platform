import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Contact from '../models/Contact.js';
import Booking from '../models/Booking.js';
import { FormSubmission } from '../models/Form.js';
import { Inventory } from '../models/Inventory.js';

const router = express.Router();

// Global search endpoint
router.get('/search', authenticate, async (req, res) => {
    try {
        const { q, type } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ results: [] });
        }

        const searchQuery = q.trim();
        const results = [];

        // Search contacts
        if (!type || type === 'contacts') {
            const contacts = await Contact.find({
                workspace: req.user.workspace,
                $or: [
                    { firstName: { $regex: searchQuery, $options: 'i' } },
                    { lastName: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                    { phone: { $regex: searchQuery, $options: 'i' } }
                ]
            }).limit(5);

            results.push(...contacts.map(c => ({
                type: 'contact',
                id: c._id,
                title: `${c.firstName} ${c.lastName}`,
                subtitle: c.email,
                link: `/contacts/${c._id}`
            })));
        }

        // Search bookings
        if (!type || type === 'bookings') {
            const bookings = await Booking.find({
                workspace: req.user.workspace,
                $or: [
                    { serviceType: { $regex: searchQuery, $options: 'i' } },
                    { 'contact.firstName': { $regex: searchQuery, $options: 'i' } },
                    { 'contact.lastName': { $regex: searchQuery, $options: 'i' } }
                ]
            }).limit(5);

            results.push(...bookings.map(b => ({
                type: 'booking',
                id: b._id,
                title: `${b.serviceType} - ${b.contact.firstName} ${b.contact.lastName}`,
                subtitle: new Date(b.dateTime).toLocaleDateString(),
                link: `/bookings`
            })));
        }

        // Search inventory
        if (!type || type === 'inventory') {
            const items = await Inventory.find({
                workspace: req.user.workspace,
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { category: { $regex: searchQuery, $options: 'i' } }
                ]
            }).limit(5);

            results.push(...items.map(i => ({
                type: 'inventory',
                id: i._id,
                title: i.name,
                subtitle: `Stock: ${i.currentQuantity} ${i.unit}`,
                link: `/inventory`
            })));
        }

        res.json({ results: results.slice(0, 10) });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

export default router;
