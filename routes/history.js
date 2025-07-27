const express = require('express');
const ParkingHistory = require('../models/ParkingHistory');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/parking-history
// @desc    Get the parking history of the logged-in user
// @access  Private (User only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Get the parking history of the logged-in user and populate booking details
        const history = await ParkingHistory.find({ user: req.user.id })
            .populate({
                path: 'booking',
                populate: {
                    path: 'parkingSpace',
                    select: 'location spaceNumber'
                }
            })
            .sort({ date: -1 });  // Sort by date in descending order

        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// @route   POST /api/parking-history
// @desc    Add an entry to the parking history
// @access  Private (User only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { parkingSpaceId, slotId, date } = req.body;

        const parkingHistory = new ParkingHistory({
            user: req.user.id,
            parkingSpace: parkingSpaceId,
            slotId,
            date
        });

        await parkingHistory.save();
        res.json({ success: true, message: 'Parking history recorded', parkingHistory });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
