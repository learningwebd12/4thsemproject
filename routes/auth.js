const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Register Route (GET)
router.get("/register", (req, res) => {
  res.render("register");
});

// Register Route (POST)
router.post("/register", async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match!");
    return res.redirect("/auth/register");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email is already registered.");
      return res.redirect("/auth/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ fullname, email, password: hashedPassword });
    await newUser.save();
    req.flash("success", "Registration successful. Please log in.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error during registration.");
    res.redirect("/auth/register");
  }
});

// Login Route (GET)
router.get("/login", (req, res) => {
  res.render("login");
});

// Login Route (POST)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    req.session.isAuthenticated = true;
    req.session.user = user;
    req.flash("success", "Login successful.");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error during login.");
    res.redirect("/auth/login");
  }
});

module.exports = router;
