import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceActive } from '../middleware/workspaceCheck.js';
import { requirePermission } from '../middleware/roleCheck.js';
import { Form, FormSubmission } from '../models/Form.js';
import Contact from '../models/Contact.js';

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
        console.log("Creating form template...", req.body);
        const { name, description, type, fields, linkedToServiceTypes } = req.body;

        const form = await Form.create({
            workspace: req.user.workspace,
            name,
            description,
            type,
            fields,
            linkedToServiceTypes,
        });

        console.log("Form created successfully:", form._id);
        res.status(201).json({ message: 'Form created', form });
    } catch (error) {
        console.error("Failed to create form:", error);
        res.status(500).json({ error: 'Failed to create form' });
    }
});

// Update form template
router.put('/templates/:id', authenticate, checkWorkspaceActive, requirePermission('forms'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, fields, linkedToServiceTypes, isActive } = req.body;

        const form = await Form.findOneAndUpdate(
            { _id: id, workspace: req.user.workspace },
            { name, description, type, fields, linkedToServiceTypes, isActive },
            { new: true }
        );

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        res.json({ message: 'Form updated', form });
    } catch (error) {
        console.error("Failed to update form:", error);
        res.status(500).json({ error: 'Failed to update form' });
    }
});

// Delete a form template
router.delete('/templates/:id', authenticate, checkWorkspaceActive, requirePermission('forms'), async (req, res) => {
    try {
        const { id } = req.params;

        const form = await Form.findOneAndDelete({ _id: id, workspace: req.user.workspace });

        if (!form) {
            return res.status(404).json({ error: 'Form template not found' });
        }

        res.json({ message: 'Form template deleted successfully' });
    } catch (error) {
        console.error("Failed to delete form template:", error);
        res.status(500).json({ error: 'Failed to delete form template' });
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


// Delete a form submission
router.delete('/submissions/:id', authenticate, checkWorkspaceActive, requirePermission('forms'), async (req, res) => {
    try {
        const { id } = req.params;

        const submission = await FormSubmission.findOneAndDelete({ _id: id, workspace: req.user.workspace });

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        console.error("Failed to delete submission:", error);
        res.status(500).json({ error: 'Failed to delete submission' });
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

        let finalContactId = contactId;

        // If no contact ID provided, try to find/create from responses
        if (!finalContactId && responses) {
            // Find email field
            const emailField = form.fields.find(f => f.type === 'email');
            const nameField = form.fields.find(f => f.label.toLowerCase().includes('name'));

            if (emailField && responses[emailField.label]) {
                const email = responses[emailField.label];
                let contact = await Contact.findOne({ workspace: form.workspace, email });

                if (!contact) {
                    // Create new contact
                    const name = (nameField && responses[nameField.label]) ? responses[nameField.label] : 'Unknown';
                    const nameStr = String(name || 'Unknown');
                    const [firstName, ...lastNameParts] = nameStr.split(' ');
                    const lastName = lastNameParts.join(' ');

                    contact = await Contact.create({
                        workspace: form.workspace,
                        firstName: firstName || 'Unknown',
                        lastName: lastName || '',
                        email,
                        source: 'form_submission'
                    });
                }
                finalContactId = contact._id;
            }
        }

        const submission = await FormSubmission.create({
            workspace: form.workspace,
            form: formId,
            contact: finalContactId, // Can be null now
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

// Send form to contact via email
router.post('/send', authenticate, checkWorkspaceActive, requirePermission('forms'), async (req, res) => {
    try {
        const { formId, email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }

        const form = await Form.findOne({ _id: formId, workspace: req.user.workspace });
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Create a pending submission/contact if needed? 
        // For now, let's just send the link.
        // Ideally we should create a contact or track who we sent it to.
        // Let's create a pending submission with just the email if possible, or just send the public link.
        // The requirement is simple: "email will be sent".

        // We need to import emailService dynamically or at top. 
        // Let's use the public link format: /forms/public/:id
        const publicLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/forms/public/${formId}`;

        // Import emailService
        const { sendEmail } = await import('../services/emailService.js');

        const emailContent = `
            <h2>${form.name}</h2>
            <p>${form.description || 'Please fill out this form.'}</p>
            <p><a href="${publicLink}" style="padding: 10px 20px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 5px;">Open Form</a></p>
            <p>Or copy this link: ${publicLink}</p>
        `;

        await sendEmail(
            req.user.workspace,
            email, // Just pass the email string
            `Form Request: ${form.name}`,
            emailContent
        );

        // Track that we sent it? 
        // Creating a placeholder submission for tracking would be good practice
        /*
        await FormSubmission.create({
            workspace: req.user.workspace,
            form: formId,
            status: 'pending',
            sentAt: new Date(),
            // contact: ... we don't have a contact ID yet unless we look up or create
        });
        */

        res.json({ message: 'Form sent successfully' });
    } catch (error) {
        console.error("Failed to send form:", error);
        res.status(500).json({ error: 'Failed to send form email' });
    }
});

export default router;
