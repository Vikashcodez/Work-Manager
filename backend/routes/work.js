const express = require("express");
const mongoose = require("mongoose");
const Work = require("../models/Work");
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ✅ Auto-generate Work ID (WM-00001, WM-00002, ...)
const generateWorkId = async () => {
  const lastWork = await Work.findOne().sort({ createdAt: -1 }); 
  let newId = "WM-00001"; 

  if (lastWork && lastWork.workId) {
    const lastNumber = parseInt(lastWork.workId.split("-")[1], 10);
    newId = `WM-${String(lastNumber + 1).padStart(5, "0")}`;
  }

  return newId;
};

// ✅ Add New Work (Authenticated)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { title, description, startDate, deadline, workDescription, assignedEmployee, stages } = req.body;

    if (!title || !description || !startDate || !deadline || !workDescription || !assignedEmployee || !stages.length) {
      return res.status(400).json({ msg: "All fields are required, including at least one stage" });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedEmployee)) {
      return res.status(400).json({ msg: "Invalid Employee ID" });
    }

    const employee = await Employee.findById(assignedEmployee);
    if (!employee) return res.status(404).json({ msg: "Assigned employee not found" });

    const workId = await generateWorkId();

    const newWork = new Work({
      workId,
      title,
      description,
      startDate,
      deadline,
      workDescription,
      assignedEmployee: employee._id,
      stages,
      currentStage: 0,
      status: stages[0], 
      organization: employee.organization || "Unknown",
      activityLog: [
        {
          user: "System",
          comment: "Work created",
          stageChange: stages[0],
          timestamp: new Date(),
        },
      ],
    });

    await newWork.save();
    res.status(201).json({ msg: "Work added successfully", work: newWork });
  } catch (error) {
    console.error("🚨 Work Creation Error:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Get Works Assigned to a Specific Employee (Fix: Moved Above `/:id`)
router.get("/employee/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Employee ID" });
    }

    const works = await Work.find({ assignedEmployee: id })
      .populate("assignedEmployee", "name position email");

    res.json(works.length ? works : []);
  } catch (error) {
    console.error("🚨 Error fetching employee works:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Get Work by ID (Now Placed Below `/employee/:id`)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid Work ID" });
    }

    const work = await Work.findById(req.params.id).populate("assignedEmployee", "name position email organization");

    if (!work) return res.status(404).json({ msg: "Work not found" });

    res.json(work);
  } catch (error) {
    console.error("🚨 Error fetching work:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Get Activity Log for Work
router.get("/:id/activities", authMiddleware, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ msg: "Work not found" });

    res.json(work.activityLog);
  } catch (error) {
    console.error("🚨 Error fetching activities:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Update Work Stage & Status
router.put("/update-stage/:id", authMiddleware, async (req, res) => {
  try {
    const { stageIndex, comment, timeSpent } = req.body;
    const workId = req.params.id;

    if (stageIndex === undefined) {
      return res.status(400).json({ msg: "Stage index is required" });
    }

    const work = await Work.findById(workId);
    if (!work) return res.status(404).json({ msg: "Work not found" });

    if (stageIndex < 0 || stageIndex >= work.stages.length) {
      return res.status(400).json({ msg: "Invalid stage index" });
    }

    if (req.user._id.toString() !== work.assignedEmployee.toString()) {
      return res.status(403).json({ msg: "Unauthorized: Only the assigned employee can update the work stage" });
    }

    work.currentStage = stageIndex;
    work.status = work.stages[stageIndex];
    work.updatedAt = new Date();

    work.activityLog.push({
      user: req.user.name,
      comment: comment || `Updated status to ${work.stages[stageIndex]}`,
      timeSpent: timeSpent || "0h",
      stageChange: work.stages[stageIndex],
      timestamp: new Date(),
    });

    await work.save();
    return res.json({ msg: "Stage updated successfully", work });
  } catch (error) {
    console.error("🚨 Error updating stage:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Add a Comment to Work
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { comment, timeSpent } = req.body;
    const workId = req.params.id;

    if (!comment) {
      return res.status(400).json({ msg: "Comment is required" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ msg: "Work not found" });
    }

    work.activityLog.push({
      user: req.user.name,
      comment,
      timeSpent: timeSpent || "0h",
      timestamp: new Date(),
    });

    await work.save();
    return res.json({ msg: "Comment added successfully", work });
  } catch (error) {
    console.error("🚨 Error adding comment:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
