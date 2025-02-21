const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middlewares/auth");
const Service = require("../models/service.model");
const Booking = require("../models/booking.model");

router.get("/", async (req, res) => {
  try {
    const services = await Service.find().populate("category");
    res.render("services", { services });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to retrieve services.");
    res.redirect("/admin");
  }
});
router.post("/book-service/:id", ensureAuthenticated, async (req, res) => {
  const userId = req.session.user._id;
  const serviceId = req.params.id;

  try {
    // Check if the user has already booked the same service
    const existingBooking = await Booking.findOne({
      user: userId,
      service: serviceId,
    });

    if (existingBooking) {
      req.flash("error", "You have already booked this service.");
      return res.redirect("/services");
    }

    // Create a new booking
    const newBooking = new Booking({
      user: userId,
      service: serviceId,
      bookingDate: new Date(), // Fixed: Changed 'date' to 'bookingDate'
    });

    await newBooking.save();

    console.log(`User ${userId} booked service ${serviceId}`);

    req.flash("success", "Service booked successfully!");
    res.redirect("/services");
  } catch (error) {
    console.error("Booking Error:", error);
    req.flash("error", "Something went wrong while booking the service.");
    res.redirect("/services");
  }
});

module.exports = router;
