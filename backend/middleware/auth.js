import jwt from 'jsonwebtoken';

const FALLBACK_SECRET = 'your-secret-key-change-in-production';

/**
 * Helper to get the secret, stripping any potential quotes from env var
 */
const getSecret = () => {
    let secret = process.env.JWT_SECRET;
    if (secret) {
        // Strip leading/trailing quotes if they exist
        secret = secret.replace(/^["'](.+)["']$/, '$1');
        return secret;
    }
    return FALLBACK_SECRET;
};

export const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.warn(`[AUTH] No token provided for ${req.originalUrl}`);
            return res.status(401).json({ error: 'No token provided' });
        }

        const currentSecret = getSecret();
        console.log(`[AUTH] Verifying with secret prefix: ${currentSecret.substring(0, 5)}...`);

        let decoded;
        try {
            decoded = jwt.verify(token, currentSecret);
        } catch (primaryErr) {
            console.log(`[AUTH] Primary verification failed: ${primaryErr.message}`);
            // If primary verification fails, try the absolute fallback secret 
            if (currentSecret !== FALLBACK_SECRET) {
                try {
                    decoded = jwt.verify(token, FALLBACK_SECRET);
                    console.log(`[AUTH] Verified using FALLBACK_SECRET`);
                } catch (fallbackErr) {
                    console.error(`[AUTH] Both secrets failed for token.`);
                    throw primaryErr;
                }
            } else {
                throw primaryErr;
            }
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error(`[AUTH] Final Failure [${req.originalUrl}]:`, error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const generateToken = (user) => {
    const currentSecret = getSecret();
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            workspace: user.workspace
        },
        currentSecret,
        { expiresIn: '7d' }
    );
};
