import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roleCheck.js';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';

const router = express.Router();

// Get all staff members
router.get('/', authenticate, requireOwner, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.user.workspace).populate('staff.user');

        res.json({ staff: workspace.staff });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// Invite staff member
router.post('/invite', authenticate, requireOwner, async (req, res) => {
    try {
        const { email, firstName, lastName, permissions } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create temporary password (should be sent via email in production)
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create staff user
        user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'staff',
            workspace: req.user.workspace,
            permissions,
        });

        // Add to workspace
        const workspace = await Workspace.findById(req.user.workspace);
        workspace.staff.push({
            user: user._id,
            permissions,
        });
        await workspace.save();

        res.status(201).json({
            message: 'Staff member invited',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            tempPassword, // In production, send this via email
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to invite staff member' });
    }
});

// Update staff permissions
router.patch('/:userId/permissions', authenticate, requireOwner, async (req, res) => {
    try {
        const { permissions } = req.body;

        // Update user permissions
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { permissions },
            { new: true }
        );

        // Update workspace staff array
        const workspace = await Workspace.findById(req.user.workspace);
        const staffMember = workspace.staff.find(s => s.user.toString() === req.params.userId);
        if (staffMember) {
            staffMember.permissions = permissions;
            await workspace.save();
        }

        res.json({ message: 'Permissions updated', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update permissions' });
    }
});

export default router;
