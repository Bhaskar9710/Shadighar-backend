const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Modals/User");

const router = express.Router();

// ===================
// Register
// ===================
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    // Auto-login after registration
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "User registered & logged in",
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone,  role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================
// Login
// ===================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone,  role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;  // ✅ CommonJS export
