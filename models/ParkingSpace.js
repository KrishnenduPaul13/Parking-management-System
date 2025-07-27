const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' }
});

const ParkingSpaceSchema = new mongoose.Schema({
  location: { type: String, required: true },
  spaceNumber: { type: String, required: true, unique: true },
  pricePerHour: { type: Number, required: true },
  slots: [SlotSchema],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operatingHours: {
    start: { type: Number, default: 9 },
    end: { type: Number, default: 21 }
  }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSpace', ParkingSpaceSchema);