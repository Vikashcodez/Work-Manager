const express = require("express");
const mongoose = require("mongoose");
const Work = require("../models/Work");
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ✅ Auto-generate Work ID (Ensures uniqueness)
const generateWorkId = async () => {
  const lastWork = await Work.findOne().sort({ createdAt: -1 });
  let newId = "WM-00001";

  if (lastWork && lastWork.workId) {
    const lastNumber = parseInt(lastWork.workId.split("-")[1], 10);
    newId = `WM-${String(lastNumber + 1).padStart(5, "0")}`;
  }

  return newId;
};

// ✅ Add New Work
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { title, description, startDate, deadline, workDescription, assignedEmployee, stages } = req.body;

    if (!title || !description || !startDate || !deadline || !workDescription || !assignedEmployee || !stages?.length) {
      return res.status(400).json({ msg: "All fields are required, including at least one stage." });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedEmployee)) {
      return res.status(400).json({ msg: "Invalid Employee ID." });
    }

    const employee = await Employee.findById(assignedEmployee);
    if (!employee) return res.status(404).json({ msg: "Assigned employee not found." });

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
    res.status(201).json({ msg: "Work added successfully.", work: newWork });
  } catch (error) {
    console.error("🚨 Work Creation Error:", error.message);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});

// ✅ Get All Works
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(403).json({ msg: "Unauthorized: Organization not found." });
    }

    const works = await Work.find({ organization: req.user.organization })
      .populate("assignedEmployee", "name position email organization");

    res.json(works);
  } catch (error) {
    console.error("🚨 Error fetching works:", error.message);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});

// ✅ Get Works Assigned to a Specific Employee
router.get("/employee/:employeeId", authMiddleware, async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ msg: "Invalid Employee ID." });
    }

    const works = await Work.find({ assignedEmployee: employeeId })
      .populate("assignedEmployee", "name position email organization");

    if (!works.length) {
      return res.status(404).json({ msg: "No assigned works found for this employee." });
    }

    res.json(works);
  } catch (error) {
    console.error("🚨 Error fetching assigned works:", error.message);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});

// ✅ Get Work by ID or Work ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let work;

    if (mongoose.Types.ObjectId.isValid(id)) {
      work = await Work.findById(id).populate("assignedEmployee", "name position email organization");
    }

    if (!work) {
      work = await Work.findOne({ workId: id }).populate("assignedEmployee", "name position email organization");
    }

    if (!work) return res.status(404).json({ msg: "Work not found." });

    res.json(work);
  } catch (error) {
    console.error("🚨 Error fetching work:", error.message);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});

// ✅ Edit Work
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, startDate, deadline, workDescription, assignedEmployee, stages } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid Work ID." });
    }

    const updatedWork = await Work.findByIdAndUpdate(
      req.params.id,
      { title, description, startDate, deadline, workDescription, assignedEmployee, stages, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedWork) return res.status(404).json({ msg: "Work not found." });

    res.json({ msg: "Work updated successfully.", work: updatedWork });
  } catch (error) {
    console.error("🚨 Error updating work:", error.message);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});

// ✅ Delete Work
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid Work ID." });
    }

    const deletedWork = await Work.findByIdAndDelete(req.params.id);
    if (!deletedWork) return res.status(404).json({ msg: "Work not found." });

    res.json({ msg: "Work deleted successfully." });
  } catch (error) {
    console.error("🚨 Error deleting work:", error.message);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});
// ✅ Get Activity Logs for a Work
router.get("/:id/activities", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate Work ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Work ID." });
    }

    // ✅ Find work by ID
    const work = await Work.findById(id, "activityLog");
    if (!work) return res.status(404).json({ msg: "Work not found." });

    // ✅ Return activity logs
    res.json(work.activityLog);
  } catch (error) {
    console.error("🚨 Error fetching activity logs:", error.message);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});

// ✅ Get Work by ID or Work ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let work;

    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      work = await Work.findById(id).populate("assignedEmployee", "name position email organization");
    }
    
    // If not found by `_id`, try searching by `workId`
    if (!work) {
      work = await Work.findOne({ workId: id }).populate("assignedEmployee", "name position email organization");
    }

    if (!work) return res.status(404).json({ msg: "Work not found" });

    res.json(work);
  } catch (error) {
    console.error("🚨 Error fetching work:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});



// ✅ Update Work Stage
router.put("/update-stage/:id", authMiddleware, async (req, res) => {
  try {
    const { stageIndex, comment, timeSpent } = req.body;
    const workId = req.params.id;

    if (stageIndex === undefined || isNaN(stageIndex)) {
      return res.status(400).json({ msg: "Valid stage index is required." });
    }

    const work = await Work.findById(workId);
    if (!work) return res.status(404).json({ msg: "Work not found." });

    if (stageIndex < 0 || stageIndex >= work.stages.length) {
      return res.status(400).json({ msg: "Invalid stage index." });
    }

    if (req.user.role !== "admin" && req.user._id.toString() !== work.assignedEmployee.toString()) {
      return res.status(403).json({ msg: "Unauthorized: Only the assigned employee or admin can update the work stage." });
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

    return res.json({ msg: "Stage updated successfully.", work });
  } catch (error) {
    console.error("🚨 Error updating work stage:", error);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
});

module.exports = router;
