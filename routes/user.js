const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Booking = require("../models/booking.model");
const { ensureAuthenticated } = require("../middlewares/auth");

router.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user._id;

    // Fetch user details (fullname & email)
    const user = await User.findById(userId).select("fullname email");

    // Fetch bookings & ensure service is populated
    const bookings = await Booking.find({ user: userId })
      .populate("service")
      .exec();

    res.render("profile", { user, bookings });
  } catch (err) {
    console.error("Profile Error:", err);
    req.flash("error", "Unable to load profile.");
    res.redirect("/");
  }
});
router.post(
  "/cancel-booking/:bookingId",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const bookingId = req.params.bookingId;

      // Find the booking and ensure the logged-in user owns it
      const booking = await Booking.findOne({
        _id: bookingId,
        user: req.session.user._id,
      });

      if (!booking) {
        req.flash(
          "error",
          "Booking not found or you do not have permission to cancel it."
        );
        return res.redirect("/user/profile");
      }

      // Delete the booking
      await Booking.findByIdAndDelete(bookingId);

      req.flash("success", "Successfully canceled the booking.");
      res.redirect("/user/profile");
    } catch (err) {
      console.error("Error canceling booking:", err);
      req.flash("error", "An error occurred while canceling the booking.");
      res.redirect("/user/profile");
    }
  }
);

module.exports = router;
