const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../models/contact.model");

router.get("/", (req, res) => {
  res.render("contact");
});

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Basic input validation
  if (!name || !email || !phone || !message) {
    req.flash("error", "Please fill in all fields.");
    return res.redirect("/contact");
  }

  try {
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your_email@gmail.com",
        pass: "your_email_password",
      },
    });

    const mailOptions = {
      from: "regmiganesh87@gmail.com",
      to: "regmiganesh87@gmail.com",
      subject: "New Contact Message",
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    req.flash("success", "Your message has been sent successfully!");
    res.redirect("/contact");
  } catch (error) {
    console.error(error.message);
    req.flash("error", "An error occurred while sending your message.");
    res.redirect("/contact");
  }
});

router.delete("/admin/contact/:contactId", async (req, res) => {
  const { contactId } = req.params;

  try {
    await Contact.findByIdAndDelete(contactId);
    req.flash("success", "Contact has been deleted successfully.");
    res.redirect("/admin/contacts");
  } catch (error) {
    console.error("Error deleting contact:", error);
    req.flash("error", "An error occurred while deleting the contact.");
    res.redirect("/admin/contacts");
  }
});

module.exports = router;
