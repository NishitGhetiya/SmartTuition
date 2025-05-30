const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  dueDate: Date,
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Teacher
    required: true,
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Students
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Homework", homeworkSchema);
