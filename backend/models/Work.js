const mongoose = require("mongoose");

// Define the Work Schema
const WorkSchema = new mongoose.Schema({
  workId: { type: String, unique: true }, // ✅ Unique Work ID
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  workDescription: { type: String, required: true },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  stages: [{ type: String }], // ✅ Array of stages like "Development", "Testing"
  createdAt: { type: Date, default: Date.now },
});

// ✅ **Pre-save Hook to Generate Auto-Incrementing Work ID**
WorkSchema.pre("save", async function (next) {
  if (!this.workId) {
    try {
      const lastWork = await this.constructor.findOne().sort({ createdAt: -1 });
      const lastIdNumber = lastWork && lastWork.workId ? parseInt(lastWork.workId.split("-")[1]) : 0;
      this.workId = `WM-${String(lastIdNumber + 1).padStart(5, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Work", WorkSchema);
