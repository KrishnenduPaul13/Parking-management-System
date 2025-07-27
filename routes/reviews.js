const express = require('express');
const Review = require('../models/Review');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Submit a review for a parking space
// @access  Private (User only)
router.post('/', authMiddleware, async (req, res) => {
    const { parkingSpaceId, rating, comment } = req.body;

    // 🚨 Check if required fields are missing
    if (!parkingSpaceId || !rating || !comment) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const review = new Review({
            user: req.user.id,  // Ensure user is authenticated
            parkingSpace: parkingSpaceId,
            rating,
            comment,
        });

        await review.save();
        res.json({ success: true, message: 'Review submitted', review });
    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Server error while saving review" });
    }
});


// @route   GET /api/reviews
// @desc    Get all reviews submitted by the logged-in user
// @access  Private (User only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch reviews made by the logged-in user
        const reviews = await Review.find({ user: req.user.id })
            .populate('parkingSpace', 'location spaceNumber') // Optionally populate parking space details
            .sort({ createdAt: -1 });  // Sort reviews by most recent first

        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/reviews/parking/:parkingSpaceId
// @desc    Get all reviews for a specific parking space
// @access  Public (Anyone can view)
router.get('/parking/:parkingSpaceId', async (req, res) => {
    try {
        // Fetch all reviews for a particular parking space
        const reviews = await Review.find({ parkingSpace: req.params.parkingSpaceId })
            .populate('user', 'name') // Populate user name (who wrote the review)
            .sort({ createdAt: -1 }); // Sort reviews by most recent first

        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
