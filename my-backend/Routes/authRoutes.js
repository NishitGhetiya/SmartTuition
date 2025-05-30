const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User.js");

const router = express.Router();

// Validation functions
const isValidName = (name) => /^[A-Za-z ]+$/.test(name);
const isValidEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/.test(
    password
  );
const isValidMobile = (mobileNo) => /^\d{10}$/.test(mobileNo);

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, mobileNo, role } = req.body;

    if (!name || !email || !password || !mobileNo || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidName(name)) {
      return res
        .status(400)
        .json({ message: "Name must contain only letters" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and exactly 8 char. Long",
        });
    }

    if (!isValidMobile(mobileNo)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be exactly 10 digits" });
    }

    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: "Account already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, mobileNo, role });

    await user.save();

    res
      .status(201)
      .json({
        message: "Account created successfully. please login to your account",
      });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
