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
  stages: [{ type: String, required: true }], // ✅ Array of stages like "SRS", "Development", "Testing"
  currentStage: { type: Number, default: 0 }, // ✅ Tracks the current stage (0 = first stage)
  status: { type: String, default: "Not Started" }, // ✅ Stores work progress status
  organization: { type: String, required: true }, // ✅ Ensures work belongs to an organization
  activityLog: [
    {
      user: { type: String, default: "System" },
      comment: { type: String },
      timeSpent: { type: String, default: "0h" },
      stageChange: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ **Pre-save Hook to Generate Auto-Incrementing Work ID**
WorkSchema.pre("save", async function (next) {
  if (!this.workId) {
    try {
      const lastWork = await this.constructor.findOne().sort({ workId: -1 }); // Sort by workId instead of createdAt
      const lastIdNumber = lastWork && lastWork.workId ? parseInt(lastWork.workId.split("-")[1]) : 0;
      this.workId = `WM-${String(lastIdNumber + 1).padStart(5, "0")}`;
    } catch (error) {
      return next(error);
    }
  }

  // ✅ Set the initial status to the first stage if available
  if (this.stages.length > 0 && !this.status) {
    this.status = this.stages[0];
  }

  next();
});

// ✅ **Middleware to Update `updatedAt` Automatically**
WorkSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("Work", WorkSchema);
