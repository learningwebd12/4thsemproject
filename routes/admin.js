const express = require("express");
const router = express.Router();
const Service = require("../models/service.model");
const Contact = require("../models/contact.model");
const Booking = require("../models/booking.model");
const ServiceCategory = require("../models/ServiceCategory.model");
const About = require("../models/about.model");
const ServiceDetails = require("../models/serviceDetails.model");

const isAdminAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.admin) {
    return next();
  }
  req.flash("error", "Please log in as admin.");
  res.redirect("/admin/auth/login");
};

//  Admin Dashboard

// isAdminAuthenticated,
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().populate("category");
    const contacts = await Contact.find();
    const bookings = await Booking.find().populate("service").populate("user");
    const categories = await ServiceCategory.find();
    const aboutData = await About.find();
    const serviceDetails = await ServiceDetails.find().populate("service"); // Fetch Service Details

    res.render("admin/dashboard", {
      services,
      contacts,
      bookings,
      categories,
      aboutData,
      serviceDetails, // Pass it separately
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load dashboard data.");
    res.redirect("/admin");
  }
});

//  Render Add Category Form
router.get("/add-category", isAdminAuthenticated, (req, res) => {
  res.render("admin/add-category", { messages: req.flash() });
});

router.post("/add-category", isAdminAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    req.flash("error", "Please enter a category name.");
    return res.redirect("/admin/add-category");
  }

  try {
    const newCategory = new ServiceCategory({ name });
    await newCategory.save();
    req.flash("success", "Category added successfully.");
    res.redirect("/admin/add-category");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add category.");
    res.redirect("/admin/add-category");
  }
});

// Edit Category Form
router.get("/edit-category/:id", isAdminAuthenticated, async (req, res) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      req.flash("error", "Category not found.");
      return res.redirect("/admin");
    }
    res.render("admin/edit-category", { category });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load category for editing.");
    res.redirect("/admin");
  }
});

//  Update Category
router.post("/edit-category/:id", isAdminAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    req.flash("error", "Please enter a category name.");
    return res.redirect(`/admin/edit-category/${req.params.id}`);
  }

  try {
    await ServiceCategory.findByIdAndUpdate(req.params.id, { name });

    req.flash("success", "Category updated successfully.");
    res.redirect(`/admin/edit-category/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update category.");
    res.redirect(`/admin/edit-category/${req.params.id}`);
  }
});

//  Delete Category
router.post("/delete-category/:id", isAdminAuthenticated, async (req, res) => {
  try {
    await ServiceCategory.findByIdAndDelete(req.params.id);
    req.flash("success", "Category deleted successfully.");
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete category.");
    res.redirect("/admin");
  }
});

//  Render Add Service Form
// isAdminAuthenticated, add garnu xa
router.get("/add-service", async (req, res) => {
  try {
    const categories = await ServiceCategory.find();
    res.render("admin/add-service", { categories });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load categories.");
    res.redirect("/admin/services");
  }
});

//  Add Service
// isAdminAuthenticated, add garnu xa
router.post("/add-service", async (req, res) => {
  const { name, category, description, price } = req.body;

  try {
    const newService = new Service({ name, category, description, price });
    await newService.save();
    req.flash("success", "Service added successfully.");
    res.redirect("/admin/add-service");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add service.");
    res.redirect("/admin/add-service");
  }
});

//  View Services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find().populate("category");
    res.render("admin/services", { services });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to retrieve services.");
    res.redirect("/admin");
  }
});

//  Edit Service Form
// isAdminAuthenticated, add garnu xa
router.get("/edit/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("category");
    const categories = await ServiceCategory.find();
    if (!service) {
      req.flash("error", "Service not found.");
      return res.redirect("/admin/services");
    }

    res.render("admin/edit-service", { service, categories });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load service for editing.");
    res.redirect("/admin/services");
  }
});

//  Update Service
// isAdminAuthenticated, add garnu xa
router.post("/edit/:id", async (req, res) => {
  const { name, category, description, price } = req.body;

  try {
    await Service.findByIdAndUpdate(req.params.id, {
      name,
      category,
      description,
      price,
    });

    req.flash("success", "Service updated successfully.");
    res.redirect(`/admin/edit/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update service.");
    res.redirect(`/admin/edit/${req.params.id}`);
  }
});

// Delete Service
// isAdminAuthenticated, add garnu xa
router.post("/delete-service/:id", async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    req.flash("success", "Service deleted successfully.");
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete service.");
    res.redirect("/admin");
  }
});

// about us page
router.get("/add-about", async (req, res) => {
  try {
    const aboutData = await About.find(); // Fetch existing data
    res.render("admin/add-about", { aboutData });
  } catch (error) {
    console.error(error);
    res.render("admin/add-about", {
      aboutData: null,
      errorMessage: "Failed to load About Us form.",
    });
  }
});
//  Frontend: Show About Us Page
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

router.post("/add-about", isAdminAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;
    let about = await About.findOne();

    if (!about) {
      about = new About({ name, description });
    } else {
      about.name = name;
      about.description = description;
    }

    await about.save();
    req.flash("success", "About Us updated successfully.");
    res.redirect("/admin/add-about");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update About Us.");
    res.redirect("/admin/add-about");
  }
});

router.get("/edit-about/:id", isAdminAuthenticated, async (req, res) => {
  try {
    const about = await About.findById(req.params.id);
    if (!about) {
      req.flash("error", "About section not found.");
      return res.redirect("/admin/about");
    }
    res.render("admin/edit-about", { aboutData: about }); // Ensure correct variable name
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load About section for editing.");
    res.redirect("/admin/about");
  }
});

//update about
router.post("/edit-about/:id", isAdminAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;
    await About.findByIdAndUpdate(req.params.id, { name, description });

    req.flash("success", "About section updated successfully!");
    res.redirect("/admin"); // Redirect to About Us page
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update About section.");
    res.redirect("/admin");
  }
});

//  Fetch Bookings for Admin Dashboard
router.get("/bookings", isAdminAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "fullname email")
      .populate("service", "name price");

    const services = await Service.find().populate("category");
    const contacts = await Contact.find();
    const categories = await ServiceCategory.find();

    res.render("admin/dashboard", { services, contacts, bookings, categories });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to retrieve bookings.");
    res.redirect("/admin");
  }
});

router.post("/delete-booking/:id", isAdminAuthenticated, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    req.flash("success", "Booking Completed successfully");
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    req.flash("error", "failed to delete");
  }
});

router.post("/delete-message/:id", isAdminAuthenticated, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    req.flash("success", "Service deleted successfully.");
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete service.");
    res.redirect("/admin");
  }
});

module.exports = router;
