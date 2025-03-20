const express = require("express");
const router = express.Router();
const upload = require("../config/multerconfig"); // Import multer config
const ServiceDetails = require("../models/serviceDetails.model"); // Ensure this model exists
const Service = require("../models/service.model"); // Ensure Service model exists

// Render Add Service Details Form
router.get("/services-details", async (req, res) => {
  try {
    const services = await Service.find();
    res.render("admin/add-services-details", { services });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load services.");
    res.redirect("/admin/services");
  }
});

// Handle POST Request with Image Upload
router.post(
  "/services-details/add",
  upload.single("image"),
  async (req, res) => {
    try {
      const { service, description, features, price } = req.body;

      if (!req.file) {
        req.flash("error", "Please upload an image.");
        return res.redirect("/admin/services-details");
      }

      const featuresArray = features
        .split(",")
        .map((f) => f.trim())
        .slice(0, 5); // Limit to 5 features

      const newServiceDetails = new ServiceDetails({
        service,
        image: `/images/uploads/${req.file.filename}`, // Store only the path
        description,
        features: featuresArray,
        price,
      });

      await newServiceDetails.save();
      req.flash("success", "Service details added successfully.");
      res.redirect("/admin/services-details");
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to add service details.");
      res.redirect("/admin/services-details");
    }
  }
);

router.get("/edit/:id", async (req, res) => {
  try {
    const serviceDetail = await ServiceDetails.findById(req.params.id).populate(
      "service"
    );
    const services = await Service.find(); // Fetch all services for dropdown selection
    if (!serviceDetail) {
      req.flash("error", "Service detail not found.");
      return res.redirect("/admin/services-details");
    }
    res.render("admin/edit-service-details", { serviceDetail, services });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load service detail.");
    res.redirect("/admin/services-details");
  }
});

router.post("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const { service, description, features, price } = req.body;
    let updateData = {
      service,
      description,
      features: features.split(",").map((f) => f.trim()),
      price,
    };

    if (req.file) {
      updateData.image = `/images/uploads/${req.file.filename}`;
    }

    await ServiceDetails.findByIdAndUpdate(req.params.id, updateData);
    req.flash("success", "Service details updated successfully.");
    res.redirect("/admin/services-details");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update service details.");
    res.redirect("/admin/services-details");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    await ServiceDetails.findByIdAndDelete(req.params.id);
    req.flash("success", "Service detail deleted successfully.");
    res.redirect("/admin/services-details");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete service detail.");
    res.redirect("/admin/services-details");
  }
});

module.exports = router;
