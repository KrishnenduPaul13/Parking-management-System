const express = require('express');
const ParkingSpace = require('../models/ParkingSpace');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Helper function to generate slots based on operating hours
function generateSlots(startHour, endHour, slotDuration) {
  let slots = [];
  let currentStartTime = new Date();
  currentStartTime.setHours(startHour, 0, 0, 0); // Set start time (e.g., 9:00 AM)
  
  while (currentStartTime.getHours() < endHour) {
    const currentEndTime = new Date(currentStartTime.getTime() + slotDuration * 60 * 60 * 1000); // Add slot duration (in hours)
    
    slots.push({
      slotId: `${currentStartTime.toISOString()}-${currentEndTime.toISOString()}`, // Generate unique slot ID
      startTime: currentStartTime,
      endTime: currentEndTime,
      status: 'available',
    });

    currentStartTime = currentEndTime;
  }

  return slots;
}

// @route   POST /api/parking (Admin Only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' });

  const { location, spaceNumber, pricePerHour, startHour, endHour, slotDuration } = req.body;

  // Generate slots dynamically based on operating hours and slot duration
  const slots = generateSlots(startHour, endHour, slotDuration);

  const parkingSpace = new ParkingSpace({ location, spaceNumber, pricePerHour, slots, owner: req.user.id });

  await parkingSpace.save();
  res.json({ success: true, message: 'Parking space added successfully', parkingSpace });
});

// @route   GET /api/parking
// @desc    Get all parking spaces
// @access  Public
router.get('/', async (req, res) => {
  const parkingSpaces = await ParkingSpace.find();
  res.json({ success: true, parkingSpaces });
});

// @route   GET /api/parkingSpaces/:id
// @desc    Get a single parking space by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const parkingSpace = await ParkingSpace.findById(req.params.id);
    
    if (!parkingSpace) {
      return res.status(404).json({ success: false, message: 'Parking space not found' });
    }

    res.json({ success: true, parkingSpace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
