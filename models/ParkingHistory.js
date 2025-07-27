const mongoose = require('mongoose');

const ParkingHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }, // Booking ID
  checkInTime: { type: Date, required: true }, // When the user checks in
  checkOutTime: { type: Date } // When the user checks out (optional, can be set later)
}, { timestamps: true });

module.exports = mongoose.model('ParkingHistory', ParkingHistorySchema);
