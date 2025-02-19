const express = require("express");
const router = express.Router();
const About = require("../models/about.model");

// ✅ About Us Route (Frontend)
router.get("/about", async (req, res) => {
  try {
    const aboutData = await About.findOne(); // Fetch About Us data
    res.render("about", { aboutData });
  } catch (error) {
    console.error(error);
    res.render("about", {
      aboutData: null,
      errorMessage: "Failed to load About Us page.",
    });
  }
});

module.exports = router;
