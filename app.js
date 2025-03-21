const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

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
      secure: false,
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.successMessage = req.flash("success");
  res.locals.errorMessage = req.flash("error");
  next();
});

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
const userRoutes = require("./routes/user");
const serviceDetailsRoutes = require("./routes/serviceDetails");

// Use Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/auth", adminOtpAuthRoutes);
app.use("/services", serviceRoutes);
app.use("/contact", contactRouter);
app.use("/", aboutRoutes);
app.use("/user", userRoutes);
app.use("/admin", serviceDetailsRoutes);

// Home Route
app.get("/", (req, res) => {
  res.render("home");
  req.flash("success", "Service booked successfully!");
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
