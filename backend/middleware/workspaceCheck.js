import Workspace from '../models/Workspace.js';

export const checkWorkspaceActive = async (req, res, next) => {
    try {
        const workspaceId = req.user.workspace;

        if (!workspaceId) {
            return res.status(400).json({ error: 'No workspace associated with user' });
        }

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (!workspace.isActive) {
            return res.status(403).json({
                error: 'Workspace is not active. Please complete onboarding.',
                onboardingStep: workspace.onboardingStep
            });
        }

        req.workspace = workspace;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Error checking workspace status' });
    }
};
