import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import Booking from '../models/Booking.js';
import Contact from '../models/Contact.js';
import { FormSubmission } from '../models/Form.js';
import { emitAutomationEvent } from '../services/automationEngine.js';

const router = express.Router();

// Public: Create booking (NO AUTH)
router.post('/public/:workspaceId', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            serviceType,
            serviceName,
            duration,
            dateTime,
            locationType,
            location,
            notes,
        } = req.body;

        // Create or find contact — only search by fields that have values
        const orConditions = [];
        if (email) orConditions.push({ email: email.toLowerCase() });
        if (phone) orConditions.push({ phone });

        let contact = null;
        if (orConditions.length > 0) {
            contact = await Contact.findOne({
                workspace: workspaceId,
                $or: orConditions,
            });
        }

        if (!contact) {
            console.log(`🆕 Creating new contact for ${email}`);
            contact = await Contact.create({
                workspace: workspaceId,
                firstName,
                lastName,
                email,
                phone,
                source: 'booking',
                status: 'new',
            });
        } else {
            console.log(`👤 Found existing contact: ${contact._id} (Current email: ${contact.email})`);
            console.log(`📝 Updating contact with new email: ${email}`);
            // Update existing contact with latest info provided during booking
            contact.firstName = firstName || contact.firstName;
            contact.lastName = lastName || contact.lastName;
            contact.email = email?.toLowerCase() || contact.email;
            contact.phone = phone || contact.phone;
            await contact.save();
        }
        console.log(`✅ Final contact email for booking: ${contact.email}`);

        // Calculate end time
        const startTime = new Date(dateTime);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        // Create booking
        const booking = await Booking.create({
            workspace: workspaceId,
            contact: contact._id,
            serviceType,
            serviceName,
            duration,
            dateTime: startTime,
            endTime,
            locationType,
            location,
            notes,
            status: 'pending',
        });

        // Trigger automation
        emitAutomationEvent('booking_created', {
            workspaceId,
            booking,
            contact,
        });

        res.status(201).json({
            message: 'Booking created successfully!',
            booking: {
                id: booking._id,
                serviceName: booking.serviceName,
                dateTime: booking.dateTime,
            },
        });
    } catch (error) {
        console.error('Public booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Get all bookings
router.get('/', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const { status, date } = req.query;

        const query = { workspace: req.user.workspace };

        if (status) {
            query.status = status;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.dateTime = { $gte: startOfDay, $lte: endOfDay };
        }

        const bookings = await Booking.find(query)
            .populate('contact')
            .sort({ dateTime: 1 })
            .limit(100);

        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get single booking
router.get('/:id', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            workspace: req.user.workspace,
        }).populate('contact');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ booking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// Update booking status
router.patch('/:id/status', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const { status, staffNotes } = req.body;

        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, workspace: req.user.workspace },
            { status, staffNotes },
            { new: true }
        ).populate('contact');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Emit automation events for status changes
        if (status === 'confirmed') {
            emitAutomationEvent('booking_confirmed', {
                workspaceId: req.user.workspace,
                booking,
                contact: booking.contact
            });
        } else if (status === 'completed') {
            emitAutomationEvent('booking_completed', {
                workspaceId: req.user.workspace,
                booking,
                contact: booking.contact
            });
        }

        res.json({ message: 'Booking status updated', booking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

export default router;
