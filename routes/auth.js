require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ================= Register Route =================
router.post("/register", upload.single("resume"), async (req, res) => {
  try {
    console.log("Register request body:", req.body);
    console.log("Uploaded file info:", req.file);

    const { username, email, password, phone, city, role, skills } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Username, email, and password are required." });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    console.log("Existing user check:", existing);
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashed,
      phone,
      city,
      role,
      skills,
      resume: req.file ? req.file.filename : null,
    });

    await user.save();
    console.log("User saved:", user);

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Register route error:", err);
    res.status(500).json({ 
      msg: "Server error", 
      error: err.message, 
      stack: err.stack 
    });
  }
});

// ================= Login Route =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid login details" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid login details" });

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "Unauthorized" });

    const token = authHeader.split(" ")[1]; // Bearer <token>
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password"); // exclude password
    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(401).json({ msg: "Unauthorized" });
  }
});

// PUT /api/auth/profile
router.put("/profile", upload.single("avatar"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Only update editable fields
    const editableFields = [
      "name",
      "bio",
      "skills",
      "education",
      "experience",
      "linkedin",
      "github",
      "address",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Update avatar if uploaded
    if (req.file) user.avatar = req.file.filename;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("PUT /profile error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


module.exports = router;
