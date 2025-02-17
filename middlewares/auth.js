const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Login Route (POST)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("Found user:", user); 

    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch); 

    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    req.session.isAuthenticated = true;
    req.session.user = user;
    console.log("Session set:", req.session); 
    req.flash("success", "Login successful.");
    return res.redirect("/"); 
  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "Error during login.");
    return res.redirect("/auth/login");
  }
});

// Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/"); 
    }
    res.clearCookie("connect.sid"); 
    req.flash("success", "You have been logged out.");
    res.redirect("/auth/login"); 
  });
});

// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.user) {
    res.locals.userLoggedIn = true;
    res.locals.user = req.session.user;
    return next();
  }
  res.locals.userLoggedIn = false;
  req.flash("error", "Please log in to access this page.");
  res.redirect("/auth/login"); 
};

module.exports = { ensureAuthenticated };
