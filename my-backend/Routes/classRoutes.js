const express = require("express");
const router = express.Router();
const Class = require("../Models/Class");
const authenticateToken = require("../Middlewares/authMiddleware.js");
const { v4: uuidv4 } = require("uuid");

// Use auth for all routes below
//router.use(authMiddleware);

// Role check middleware
const isTeacher = (req, res, next) => {
  if (req.user.role !== "Teacher")
    return res.status(403).json({ message: "Access denied" });
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== "Student")
    return res.status(403).json({ message: "Access denied" });
  next();
};

// Create class - TEACHER ONLY
router.post("/create", authenticateToken, isTeacher, async (req, res) => {
  try {
    const { name, description, subject } = req.body;

    const newClass = new Class({
      name,
      teacher: req.user.id,
      description,
      subject,
      classCode: uuidv4().slice(0, 6).toUpperCase(),
    });

    await newClass.save();
    res
      .status(201)
      .json({ message: "Class created", classCode: newClass.classCode });
  } catch (err) {
    console.error("Create class error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Join class - STUDENT ONLY
router.post("/join", authenticateToken, isStudent, async (req, res) => {
  try {
    const { classCode } = req.body;

    const foundClass = await Class.findOne({ classCode });
    if (!foundClass)
      return res.status(404).json({ message: "Class not found" });

    if (foundClass.students.some(student => student.toString()===req.user.id)) {
      return res.status(400).json({ message: "Already joined this class" });
    }

    foundClass.students.push(req.user.id);
    await foundClass.save();

    res.json({ message: "Class joined successfully" });
  } catch (err) {
    console.error("Join class error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get teacher classes with student count
router.get(
  "/teacher/classes",
  authenticateToken,
  isTeacher,
  async (req, res) => {
    try {
      const classes = await Class.find({ teacher: req.user.id })
        .populate("students", "name email")
        .populate("teacher", "name");

      res.json(
        classes.map((cls) => ({
          id: cls._id,
          name: cls.name,
          classCode: cls.classCode,
          subject: cls.subject,
          description: cls.description,
          dateTime: cls.dateTime,
          studentCount: cls.students.length,
          teacherName: cls.teacher.name,
        }))
      );
    } catch (err) {
      console.error("Fetch teacher classes error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);
// Get student's joined classes
router.get("/student/classes", authenticateToken, isStudent, async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user.id })
      .populate("teacher", "name");

    res.json(
      classes.map((cls) => ({
        id: cls._id,
        name: cls.name,
        subject: cls.subject,
        description: cls.description,
        classCode: cls.classCode,
        dateTime: cls.dateTime,
        teacherName: cls.teacher.name,
      }))
    );
  } catch (err) {
    console.error("Fetch student classes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Route: /api/class/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate("students", "name email mobileNo").populate("teacher","name");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    res.json({
      class: {
        name: cls.name,
        subject: cls.subject,
        description: cls.description,
        classCode: cls.classCode,
        dateTime: cls.dateTime,
        teacherName: cls.teacher.name,
        studentCount: cls.students.length,
      },
      students: cls.students,
    });
  } catch (err) {
    console.error("Get class detail error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Edit class - TEACHER ONLY
router.put("/:id/edit", authenticateToken, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subject } = req.body;

    const cls = await Class.findOne({ _id: id, teacher: req.user.id });
    if (!cls) {
      return res.status(404).json({ message: "Class not found or unauthorized" });
    }

    cls.name = name || cls.name;
    cls.description = description || cls.description;
    cls.subject = subject || cls.subject;

    await cls.save();
    res.json({ message: "Class updated successfully" });
  } catch (err) {
    console.error("Edit class error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Delete class - TEACHER ONLY
router.delete("/:id/delete", authenticateToken, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;

    const cls = await Class.findOneAndDelete({ _id: id, teacher: req.user.id });
    if (!cls) {
      return res.status(404).json({ message: "Class not found or unauthorized" });
    }

    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("Delete class error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Remove a student from class - TEACHER ONLY
router.put("/:classId/remove-student/:studentId", authenticateToken, isTeacher, async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const cls = await Class.findOne({ _id: classId, teacher: req.user.id });
    if (!cls) {
      return res.status(404).json({ message: "Class not found or unauthorized" });
    }

    const initialLength = cls.students.length;
    cls.students = cls.students.filter((id) => id.toString() !== studentId);

    if (cls.students.length === initialLength) {
      return res.status(404).json({ message: "Student not found in this class" });
    }

    await cls.save();
    res.json({ message: "Student removed from class successfully" });
  } catch (err) {
    console.error("Remove student error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
