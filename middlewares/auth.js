const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const sessionCookie = req.cookies.user_session;
        if (!sessionCookie) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const sessionData = JSON.parse(sessionCookie);
        req.user = { id: sessionData.id, role: sessionData.role };

        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid session' });
    }
};

module.exports = authMiddleware;
