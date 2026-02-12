export const requireOwner = (req, res, next) => {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ error: 'Access denied. Owner role required.' });
    }
    next();
};

export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (req.user.role === 'owner') {
            // Owners have all permissions
            return next();
        }

        // Check staff permissions
        if (!req.user.permissions || !req.user.permissions[permission]) {
            return res.status(403).json({
                error: `Access denied. ${permission} permission required.`
            });
        }

        next();
    };
};
