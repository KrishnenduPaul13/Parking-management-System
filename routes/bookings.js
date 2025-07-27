const express = require('express');
const Booking = require('../models/Booking');
const ParkingSpace = require('../models/ParkingSpace');
const ParkingHistory = require('../models/ParkingHistory');  // Import ParkingHistory model
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Helper function to check if times overlap
function isTimeOverlap(existingBooking, startTime, endTime) {
  return existingBooking.startTime < endTime && existingBooking.endTime > startTime;
}

// @route   POST /api/bookings
router.post('/', authMiddleware, async (req, res) => {
    const { parkingSpaceId, slotId, bookingDate, startTime, endTime } = req.body;

    try {
      const parkingSpace = await ParkingSpace.findById(parkingSpaceId);
      if (!parkingSpace) {
        return res.status(404).json({ success: false, message: 'Parking space not found' });
      }

      const slot = parkingSpace.slots.find(slot => slot.slotId === slotId);
      if (!slot) {
        return res.status(404).json({ success: false, message: 'Slot not found' });
      }

      // Convert startTime and endTime to Date objects
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Check for conflicting bookings
      const conflictingBooking = await Booking.findOne({
        parkingSpace: parkingSpaceId,
        bookingDate,
        slotId,
        $or: [
          { startTime: { $lt: endDate }, endTime: { $gt: startDate } },
        ],
      });

      if (conflictingBooking) {
        return res.status(400).json({ success: false, message: 'This slot is already booked for the selected time' });
      }

      // Create booking
      const booking = new Booking({
        user: req.user.id,
        parkingSpace: parkingSpaceId,
        slotId,
        bookingDate,
        startTime: startDate,
        endTime: endDate,
      });

      await booking.save();

      // Create a parking history entry for the booking
      const parkingHistory = new ParkingHistory({
        user: req.user.id,
        booking: booking._id,  // Link to the booking
        checkInTime: new Date(),  // Use the current time as check-in time
      });

      await parkingHistory.save();

      // Update the slot status to 'booked'
      slot.status = 'booked';
      await parkingSpace.save();

      res.json({ success: true, message: 'Booking and parking history created successfully', booking, parkingHistory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error, please try again later' });
    }
});

// @route   PUT /api/bookings/cancel/:id
router.put('/cancel/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    const parkingSpace = await ParkingSpace.findById(booking.parkingSpace);
    const slot = parkingSpace.slots.find(s => s.slotId === booking.slotId);
    if (slot) {
      slot.status = 'available';
      await parkingSpace.save();
    }

    booking.status = 'canceled';
    await booking.save();

    res.json({ success: true, message: 'Booking canceled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error, please try again later' });
  }
});

// @route   GET /api/bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('parkingSpace');
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error, please try again later' });
  }
});
router.get('/latest', authMiddleware, async (req, res) => {
  try {
      const latestBooking = await Booking.findOne({ user: req.user.id })
          .sort({ createdAt: -1 })
          .populate('parkingSpace', 'location');

      if (!latestBooking) {
          return res.json({ success: false, message: "No active bookings found" });
      }

      res.json({ success: true, booking: latestBooking });
  } catch (err) {
      res.status(500).json({ success: false, message: "Server error fetching booking" });
  }
});


module.exports = router;
