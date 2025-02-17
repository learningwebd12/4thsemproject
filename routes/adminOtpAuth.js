const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const session = require("express-session");
require("dotenv").config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
let otpStorage = {}; 


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

router.get("/login", (req, res) => {
  res.render("admin/login"); 
});


async function sendOTP(email, otp) {
  console.log(`⚡ Sending OTP to: ${email}`);

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Your OTP Code for Admin Login",
    text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email Sent:", info.response);

  
    otpStorage[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error; 
  }
}


router.post("/send-otp", async (req, res) => {
  
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");

  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
    await sendOTP(email, otp);
    res.redirect(`/admin/auth/enter-otp?email=${email}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send("Failed to send OTP");
  }
});


router.get("/enter-otp", (req, res) => {

  const { email } = req.query;
  res.render("admin/enter-otp", { email });
});


router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (
    otpStorage[email] &&
    otpStorage[email].otp == otp &&
    Date.now() < otpStorage[email].expires
  ) {
    req.session.isAuthenticated = true;
    req.session.admin = { email };
    delete otpStorage[email];
    req.flash("success", "Admin login successful.");
    res.redirect("/admin");
  } else {
    req.flash("error", "Invalid or expired OTP.");
    res.redirect("/admin/auth/enter-otp");
  }
});

module.exports = router;
