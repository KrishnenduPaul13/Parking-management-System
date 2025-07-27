const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/users (Admin Only)
router.get('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' });

    const users = await User.find().select('-password');
    res.json({ success: true, users });
});

// @route   GET /api/users/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error fetching user" });
    }
});


module.exports = router;
