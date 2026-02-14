import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roleCheck.js';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';

const router = express.Router();

// Get all staff members (accessible by all authenticated users)
router.get('/', authenticate, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.user.workspace)
            .populate('staff.user')
            .populate('owner');

        // Format staff data to include user details at the top level
        const formattedStaff = workspace.staff.map(staffMember => ({
            _id: staffMember.user._id,
            firstName: staffMember.user.firstName,
            lastName: staffMember.user.lastName,
            email: staffMember.user.email,
            role: staffMember.user.role,
            permissions: staffMember.permissions
        }));

        // Include the owner in the staff list
        const owner = {
            _id: workspace.owner._id,
            firstName: workspace.owner.firstName,
            lastName: workspace.owner.lastName,
            email: workspace.owner.email,
            role: 'owner',
            permissions: {} // Owner has full access
        };

        // Combine owner and staff, with owner first
        const allStaff = [owner, ...formattedStaff];

        console.log('Returning staff data:', JSON.stringify(allStaff, null, 2));
        res.json({ staff: allStaff });
    } catch (error) {
        console.error('Failed to fetch staff:', error);
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

        // Create temporary password
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
            permissions: permissions || {},
        });

        // Add to workspace
        const workspace = await Workspace.findById(req.user.workspace);
        workspace.staff.push({
            user: user._id,
            permissions: permissions || {},
        });
        await workspace.save();

        // Send invitation email
        // We import sendEmail dynamically to avoid circular dependency issues if any, or just standard import
        const { sendEmail } = await import('../services/emailService.js');

        try {
            await sendEmail(
                req.user.workspace,
                email,
                'Invitation to join Unified Ops',
                `Hi ${firstName},\n\nYou have been invited to join ${workspace.businessName} on Unified Ops.\n\nYour temporary password is: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nBest regards,\nThe Team`,
                `<p>Hi ${firstName},</p><p>You have been invited to join <strong>${workspace.businessName}</strong> on Unified Ops.</p><p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Please log in and change your password immediately.</p>`
            );
        } catch (emailError) {
            console.error("Failed to send invite email", emailError);
            // We don't block success, but we should warn
        }

        res.status(201).json({
            message: 'Staff member invited successfully',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error("Invite error:", error);
        res.status(500).json({ error: 'Failed to invite staff member: ' + error.message });
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

// Remove staff member
router.delete('/:userId', authenticate, requireOwner, async (req, res) => {
    try {
        const userId = req.params.userId;

        // Remove from workspace staff array
        const workspace = await Workspace.findById(req.user.workspace);
        workspace.staff = workspace.staff.filter(s => s.user.toString() !== userId);
        await workspace.save();

        // Optionally delete the user account (or just remove from workspace)
        // For now, we'll just remove from workspace
        // await User.findByIdAndDelete(userId);

        res.json({ message: 'Staff member removed successfully' });
    } catch (error) {
        console.error('Remove staff error:', error);
        res.status(500).json({ error: 'Failed to remove staff member' });
    }
});

export default router;
