import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import Contact from '../models/Contact.js';

const router = express.Router();

// Get all contacts
router.get('/', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const contacts = await Contact.find({ workspace: req.user.workspace })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ contacts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Get single contact
router.get('/:id', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const contact = await Contact.findOne({
            _id: req.params.id,
            workspace: req.user.workspace,
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ contact });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
});

// Update contact
router.put('/:id', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const { firstName, lastName, email, phone, status, notes, tags } = req.body;

        const contact = await Contact.findOneAndUpdate(
            { _id: req.params.id, workspace: req.user.workspace },
            { firstName, lastName, email, phone, status, notes, tags },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ message: 'Contact updated', contact });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

export default router;
