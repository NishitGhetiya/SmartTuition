const express = require("express");
const router = express.Router();
const authenticateToken = require("../Middlewares/authMiddleware");
const Attendance = require("../Models/Attendance");
const Class = require("../Models/Class");

// Middleware to verify teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== "Teacher") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// Create attendance (mark attendance for a class)
router.post("/mark", authenticateToken, isTeacher, async (req, res) => {
  try {
    const { classId, records } = req.body;

    // Check if class exists
    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Get current date (without time) for uniqueness check
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if attendance already exists for this class today
    const attendanceExists = await Attendance.findOne({
      classId,
      date: { $gte: todayStart, $lte: todayEnd },
    });
    // If already marked, delete previous to allow update
    // if (attendanceExists) {
    //   await Attendance.findByIdAndDelete(attendanceExists._id);
    // }
    if (attendanceExists) {
      return res.status(400).json({ message: "Attendance already marked for today" });
    }

    // Save new attendance
    const attendance = new Attendance({
      classId,
      records,
      createdBy: req.user.id, // teacher ID
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance recorded successfully" });
  } catch (err) {
    console.error("Mark attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get attendance history for a class
router.get(
  "/class/:classId",
  authenticateToken,
  async (req, res) => {
    try {
      const attendances = await Attendance.find({ classId: req.params.classId })
        .populate("records.student", "name email mobileNo")
        .sort({ date: -1 });

      res.json(attendances);
    } catch (err) {
      console.error("Fetch attendance error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);
// Get attendance history for a specific teacher
router.get("/teacher/attendancehistory", authenticateToken, isTeacher, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const attendances = await Attendance.find({ createdBy: teacherId })
      .populate("classId", "name") // populate class name
      .populate("records.student", "name email mobileNo") // populate student details
      .sort({ date: -1 }); // latest first

    res.json(attendances);
  } catch (err) {
    console.error("Fetch teacher attendance history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Route to get a student's own attendance for a specific class
router.get("/class/:classId/student", authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const classId = req.params.classId;

    const attendances = await Attendance.find({
      classId,
      "records.student": studentId,
    })
      .sort({ date: -1 })
      .select("date records createdBy")
      .populate("createdBy", "name");

    const filteredAttendance = attendances.map((att) => {
      const studentRecord = att.records.find(
        (rec) => rec.student.toString() === studentId
      );
      return {
        date: att.date,
        createdBy:att.createdBy.name,
        status: studentRecord?.status || "Absent",
      };
    });

    res.json(filteredAttendance);
  } catch (err) {
    console.error("Fetch student attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Route to get a student's own attendance
router.get("/student/attendancehistory", authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;

    const attendances = await Attendance.find({
      "records.student": studentId,
    })
      .sort({ date: -1 })
      .select("date records createdBy")
      .populate("createdBy", "name");

    const filteredAttendance = attendances.map((att) => {
      const studentRecord = att.records.find(
        (rec) => rec.student.toString() === studentId
      );
      return {
        date: att.date,
        createdBy:att.createdBy.name,
        status: studentRecord?.status || "Absent",
      };
    });

    res.json(filteredAttendance);
  } catch (err) {
    console.error("Fetch student attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Edit attendance by teacher
router.put("/edit/:attendanceId", authenticateToken, isTeacher, async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { records } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    if (attendance.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own attendance records" });
    }

    attendance.records = records;
    await attendance.save();

    res.json({ message: "Attendance updated successfully" });
  } catch (err) {
    console.error("Edit attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Delete attendance by teacher
router.delete("/delete/:attendanceId", authenticateToken, isTeacher, async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    if (attendance.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own attendance records" });
    }

    await Attendance.findByIdAndDelete(attendanceId);
    res.json({ message: "Attendance deleted successfully" });
  } catch (err) {
    console.error("Delete attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
