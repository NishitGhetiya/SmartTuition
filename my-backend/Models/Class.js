const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateTime: { type: Date, default: Date.now }, // auto-set to now
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  description: { type: String },
  subject: { type: String },
  classCode: { type: String, unique: true, required: true },
});

module.exports = mongoose.model("Class", classSchema);
