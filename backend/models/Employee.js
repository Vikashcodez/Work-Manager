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
    select: false, // ✅ Hides password by default in queries
  },
  organization: {
    type: String, // ✅ Auto-filled from admin adding the employee
    required: true,
  },
  blocked: {
    type: Boolean,
    default: false, // ✅ New field: false means employee is active
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Store admin ID who created this employee
    ref: "User", // Assuming User model stores admins
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Automatically update `updatedAt` on save
EmployeeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Employee", EmployeeSchema);
