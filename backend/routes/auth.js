const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const Employee = require("../models/Employee");

const router = express.Router();

// 🔹 User Registration (Admins Only)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, organization, position, address } = req.body;

    if (!name || !email || !password || !confirmPassword || !organization || !position || !address) {
      return res.status(400).json({ msg: "Please fill in all fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      organization,
      position,
      address,
    });

    await newUser.save();
    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (error) {
    console.error("🚨 Registration Error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// 🔑 User & Employee Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter email and password" });
    }

    let user = await User.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await Employee.findOne({ email }).select("+password"); // ✅ FIX: Ensure password is retrieved
      role = "employee";
    }

    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // ❌ Check if Employee is Blocked
    if (role === "employee" && user.blocked) {
      return res.status(403).json({ msg: "Access denied: Your account is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      msg: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name || "Employee",
        email: user.email,
        position: user.position || "Admin",
        organization: user.organization || "N/A",
        role,
      },
    });
  } catch (error) {
    console.error("🚨 Login Error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// 🔥 Google OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.CLIENT_URL + "/login" }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect(process.env.CLIENT_URL + "/login");
    }

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  }
);

// 🔥 Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out successfully" });
});

// 🔥 Check Authentication Status
router.get("/check-auth", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const model = decoded.role === "employee" ? Employee : User;

    const user = await model.findById(decoded.id).select("-password");
    if (!user) {
      res.clearCookie("token");
      return res.json({ isAuthenticated: false });
    }

    res.json({ isAuthenticated: true, user });
  } catch (error) {
    res.clearCookie("token");
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;
