const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true, // ✅ Ensures unique Employee IDs
  },
  position: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // ✅ Ensures no duplicate emails
  },
  password: {
    type: String,
    required: true,
  },
  organization: {
    type: String, // ✅ Auto-filled from admin adding the employee
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Store admin ID who created this employee
    ref: "User", // Assuming User model stores admins
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
