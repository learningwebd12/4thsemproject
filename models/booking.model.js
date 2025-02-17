const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  // Other relevant fields: status, payment details, etc.
});

module.exports = mongoose.model("Booking", bookingSchema);
