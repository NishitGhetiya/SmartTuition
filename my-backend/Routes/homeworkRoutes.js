const express = require("express");
const router = express.Router();
const Homework = require("../Models/Homework");
const Class = require("../Models/Class");
const User = require("../Models/User");
const authMiddleware = require("../Middlewares/authMiddleware"); // JWT middleware

// Middleware to verify teacher role
const isTeacher = (req, res, next) => {
  if (req.user.role !== "Teacher") {
    // Check lowercase or exact match based on your DB
    return res.status(403).json({
      message: "Access denied: Only teachers can perform this action",
    });
  }
  next();
};

// Create Homework (only for teacher)
router.post("/assign", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { classId, title, description, dueDate, assignedTo } = req.body;

    const newHomework = new Homework({
      classId,
      title,
      description,
      dueDate,
      assignedBy: req.user.id,
      assignedTo, // array of student IDs
    });

    await newHomework.save();
    res.status(201).json({
      message: "Homework assigned successfully",
      homework: newHomework,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error assigning homework", error: error.message });
  }
});

// Get Homework for a Student
router.get("/student", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    const homework = await Homework.find({
      assignedTo: studentId,
    })
      .populate("classId", "name")
      .sort({ dueDate: 1 });

    res.json(homework);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching homework", error: error.message });
  }
});

// Get Homework for a Class (for teacher view)
router.get("/class/:classId", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { classId } = req.params;

    const homework = await Homework.find({ classId })
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 });

    res.json(homework);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching class homework", error: error.message });
  }
});

router.get(
  "/teacher/homeworkhistory",
  authMiddleware,
  isTeacher,
  async (req, res) => {
    try {
      const teacherId = req.user.id; // ✅ Correct way to get the teacher ID

      const homework = await Homework.find({ assignedBy: teacherId }) // use `assignedBy`, not `teacherId`
        .populate("assignedTo", "name email mobileNo")
        .populate("classId", "name") // optional: populate class info too
        .sort({ dueDate: 1 });

      res.json(homework);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching teacher's homework",
        error: error.message,
      });
    }
  }
);

router.get("/student/homeworkhistory/:classId", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const classId = req.params.classId; // or use req.params if passed in route

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const homework = await Homework.find({
      classId,
      assignedTo: studentId,
    })
      .select("dueDate title description assignedBy")
      .populate("assignedBy","name")
      .sort({ dueDate: 1 });

    res.json(homework);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student's homework",
      error: error.message,
    });
  }
});
router.get("/student/homeworkhistory", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    const homework = await Homework.find({
      assignedTo: studentId,
    })
      .select("dueDate title description assignedBy")
      .populate("assignedBy","name")
      .sort({ dueDate: 1 });

    res.json(homework);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student's homework",
      error: error.message,
    });
  }
});
// Edit Homework (only for teacher)
router.put("/edit/:homeworkId", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const { title, description, dueDate, assignedTo } = req.body;

    // Find homework by ID and verify it's assigned by the current teacher
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    if (homework.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied: You are not the teacher who assigned this homework",
      });
    }

    // Update homework details
    homework.title = title || homework.title;
    homework.description = description || homework.description;
    homework.dueDate = dueDate || homework.dueDate;
    homework.assignedTo = assignedTo || homework.assignedTo;

    await homework.save();
    res.status(200).json({
      message: "Homework updated successfully",
      homework,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating homework",
      error: error.message,
    });
  }
});

// Delete Homework (only for teacher)
router.delete("/delete/:homeworkId", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { homeworkId } = req.params;

    // Find homework by ID and verify it's assigned by the current teacher
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    if (homework.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied: You are not the teacher who assigned this homework",
      });
    }

    // Delete the homework
    await Homework.findByIdAndDelete(homeworkId);
    res.status(200).json({
      message: "Homework deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting homework",
      error: error.message,
    });
  }
});


module.exports = router;
