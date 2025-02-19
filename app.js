const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Session Middleware
app.use(
  session({
    name: "userAdminSession",
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false, // Set true in production if using HTTPS
    },
  })
);

// Flash Messages Middleware
app.use(flash());

// Middleware to make flash messages available in views
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("success");
  res.locals.errorMessage = req.flash("error");
  next();
});

// Middleware to Check User or Admin Authentication
app.use((req, res, next) => {
  res.locals.userLoggedIn = !!req.session.user;
  res.locals.adminLoggedIn = !!req.session.admin;

  if (req.session.user) {
    res.locals.user = req.session.user;
  }
  if (req.session.admin) {
    res.locals.admin = req.session.admin;
  }
  next();
});

// Set View Engine & Public Folder
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Import Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const adminOtpAuthRoutes = require("./routes/adminOtpAuth");
const serviceRoutes = require("./routes/services");
const contactRouter = require("./routes/contact");
const aboutRoutes = require("./routes/about");

// Use Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/auth", adminOtpAuthRoutes);
app.use("/services", serviceRoutes);
app.use("/contact", contactRouter);
app.use("/", aboutRoutes);

// Home Route
app.get("/", (req, res) => {
  res.render("home");
});

// Admin Logout
app.get("/admin/logout", (req, res) => {
  req.session.admin = null;
  req.flash("success", "Admin logged out successfully.");
  res.redirect("/admin/auth/login");
});

// User Logout
app.get("/auth/logout", (req, res) => {
  req.session.user = null;
  req.flash("success", "User logged out successfully.");
  res.redirect("/auth/login");
});

// Start Server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
