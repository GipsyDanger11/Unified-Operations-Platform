import express from 'express';
import Workspace from '../models/Workspace.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Emergency endpoint to activate workspace (for development/migration)
router.post('/activate-workspace', authenticate, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.user.workspace);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        workspace.isActive = true;
        await workspace.save();

        res.json({
            message: 'Workspace activated successfully',
            workspace: {
                id: workspace._id,
                businessName: workspace.businessName,
                isActive: workspace.isActive
            }
        });
    } catch (error) {
        console.error('Error activating workspace:', error);
        res.status(500).json({ error: 'Failed to activate workspace' });
    }
});

export default router;
