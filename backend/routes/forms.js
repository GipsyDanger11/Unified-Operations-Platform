import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import { requirePermission } from '../middleware/roleCheck.js';
import { Form, FormSubmission } from '../models/Form.js';

const router = express.Router();

// Get all form templates
router.get('/templates', authenticate, checkWorkspaceActive, requirePermission('forms'), async (req, res) => {
    try {
        const forms = await Form.find({ workspace: req.user.workspace, isActive: true });
        res.json({ forms });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// Create form template
router.post('/templates', authenticate, checkWorkspaceActive, requirePermission('forms'), async (req, res) => {
    try {
        const { name, description, type, fields, linkedToServiceTypes } = req.body;

        const form = await Form.create({
            workspace: req.user.workspace,
            name,
            description,
            type,
            fields,
            linkedToServiceTypes,
        });

        res.status(201).json({ message: 'Form created', form });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create form' });
    }
});

// Get form submissions
router.get('/submissions', authenticate, checkWorkspaceActive, requirePermission('forms'), async (req, res) => {
    try {
        const { status } = req.query;

        const query = { workspace: req.user.workspace };
        if (status) {
            query.status = status;
        }

        const submissions = await FormSubmission.find(query)
            .populate('form contact booking')
            .sort({ sentAt: -1 })
            .limit(100);

        res.json({ submissions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});


// Public: Get form details (NO AUTH)
router.get('/public/:formId', async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form || !form.isActive) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.json({ form });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

// Public: Submit form (NO AUTH)
router.post('/submit/:formId', async (req, res) => {
    try {
        const { formId } = req.params;
        const { contactId, responses } = req.body;

        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const submission = await FormSubmission.create({
            workspace: form.workspace,
            form: formId,
            contact: contactId,
            responses,
            status: 'completed',
            completedAt: new Date(),
        });

        res.status(201).json({ message: 'Form submitted successfully', submission });
    } catch (error) {
        console.error("Form submission error:", error);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

export default router;
