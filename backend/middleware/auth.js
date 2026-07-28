const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ========== MAIN AUTH MIDDLEWARE ==========
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

// ========== ROLE CHECK MIDDLEWARES ==========
const isSuperAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Super Admin only.'
            });
        }
        next();
    } catch (error) {
        console.error('isSuperAdmin error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin only.'
            });
        }
        next();
    } catch (error) {
        console.error('isAdmin error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const isReporter = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const allowedRoles = ['reporter', 'admin', 'super_admin'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Reporter or Admin only.'
            });
        }
        next();
    } catch (error) {
        console.error('isReporter error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== EXPORT ==========
module.exports = {
    auth,
    isSuperAdmin,
    isAdmin,
    isReporter
};