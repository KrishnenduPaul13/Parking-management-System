const express = require('express');
const Payment = require('../models/Payment');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/payments
// @desc    Create a new payment
// @access  Private (User only)
router.post('/', authMiddleware, async (req, res) => {
    const { bookingId, amount, paymentMethod } = req.body;

    try {
        const payment = new Payment({
            booking: bookingId,
            user: req.user.id,
            amount,
            paymentMethod,
            paymentStatus: 'paid',
        });

        await payment.save();
        res.json({ success: true, message: 'Payment successful', payment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/payments
// @desc    Get the payment history of the logged-in user
// @access  Private (User only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch payments made by the logged-in user
        const payments = await Payment.find({ user: req.user.id })
            .populate('booking', 'parkingSpace slotId') // Optionally populate booking details
            .sort({ transactionDate: -1 });  // Sort by most recent payment first

        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
