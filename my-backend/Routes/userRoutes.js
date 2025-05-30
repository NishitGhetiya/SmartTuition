const express = require("express");
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const authenticateToken = require("../Middlewares/authMiddleware.js");

const router = express.Router();

// Validation functions
const isValidName = (name) => /^[A-Za-z ]+$/.test(name);
const isValidEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/.test(
    password
  );
const isValidMobile = (mobileNo) => /^\d{10}$/.test(mobileNo);

// Create User (Signup already does this - optional for admin panel)
router.post("/", async (req, res) => {
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
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and exactly 8 char. Long",
      });
    }

    if (!isValidMobile(mobileNo)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be exactly 10 digits" });
    }
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobileNo,
      role,
    });
    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get All Users
router.get("/",authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// Get User By ID
router.get("/myid", authenticateToken,async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
});

// Update User
router.put("/myid", authenticateToken,async (req, res) => {
  try {
    const { name, email, mobileNo } = req.body;

    const updateData = { name, email, mobileNo };

    if (!name || !email || !mobileNo) {
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

    if (!isValidMobile(mobileNo)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be exactly 10 digits" });
    }
    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
});

// Delete User
router.delete("/myid", authenticateToken,async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
});

module.exports = router;
