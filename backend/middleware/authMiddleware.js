const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/auth');

const getTokenFromHeader = (authorizationHeader = '') => {
    const [scheme, token] = authorizationHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
        return null;
    }
    return token;
};

const protect = (req, res, next) => {
    try {
        const token = getTokenFromHeader(req.headers.authorization || '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication token required' });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    return next();
};

const adminOnly = authorizeRoles('admin');

module.exports = {
    protect,
    authorizeRoles,
    adminOnly
};
