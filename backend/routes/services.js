import express from 'express';
import Workspace from '../models/Workspace.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';

const router = express.Router();

// GET all services for the current workspace
router.get('/', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.user.workspace);
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        res.json({ services: workspace.serviceTypes || [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// POST add a new service
router.post('/', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const { name, duration, price, description } = req.body;

        const workspace = await Workspace.findById(req.user.workspace);
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const newService = {
            name,
            duration,
            price: price || 0,
            description,
            isActive: true
        };

        workspace.serviceTypes.push(newService);
        await workspace.save();

        const addedService = workspace.serviceTypes[workspace.serviceTypes.length - 1];
        res.status(201).json({ message: 'Service added successfully', service: addedService });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add service' });
    }
});

// PUT update a service
router.put('/:id', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const { name, duration, price, description, isActive } = req.body;

        const workspace = await Workspace.findOneAndUpdate(
            { _id: req.user.workspace, 'serviceTypes._id': req.params.id },
            {
                $set: {
                    'serviceTypes.$.name': name,
                    'serviceTypes.$.duration': duration,
                    'serviceTypes.$.price': price,
                    'serviceTypes.$.description': description,
                    'serviceTypes.$.isActive': isActive
                }
            },
            { new: true }
        );

        if (!workspace) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const updatedService = workspace.serviceTypes.id(req.params.id);
        res.json({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// DELETE a service
router.delete('/:id', authenticate, checkWorkspaceActive, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.user.workspace);
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const service = workspace.serviceTypes.id(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        service.remove();
        await workspace.save();

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

export default router;
