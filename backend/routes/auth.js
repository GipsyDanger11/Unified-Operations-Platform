import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register (creates owner + workspace)
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, businessName } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'owner',
        });

        // Create workspace
        const workspace = await Workspace.create({
            businessName,
            owner: user._id,
            contactEmail: email,
            onboardingStep: 1,
        });

        // Update user with workspace
        user.workspace = workspace._id;
        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                workspace: workspace._id,
            },
            workspace: {
                id: workspace._id,
                businessName: workspace.businessName,
                onboardingStep: workspace.onboardingStep,
                isActive: workspace.isActive,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).populate('workspace');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                workspace: user.workspace?._id,
                permissions: user.permissions,
            },
            workspace: user.workspace ? {
                id: user.workspace._id,
                businessName: user.workspace.businessName,
                onboardingStep: user.workspace.onboardingStep,
                isActive: user.workspace.isActive,
            } : null,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('workspace');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                workspace: user.workspace?._id,
                permissions: user.permissions,
            },
            workspace: user.workspace ? {
                id: user.workspace._id,
                businessName: user.workspace.businessName,
                onboardingStep: user.workspace.onboardingStep,
                isActive: user.workspace.isActive,
            } : null,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
