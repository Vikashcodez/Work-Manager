const express = require("express");
const mongoose = require("mongoose");
const Work = require("../models/Work");
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// ✅ Auto-generate Work ID (WM-00001, WM-00002, ...)
const generateWorkId = async () => {
  const lastWork = await Work.findOne().sort({ createdAt: -1 }); // Get last work entry
  let newId = "WM-00001"; // Default if no work exists

  if (lastWork && lastWork.workId) {
    const lastNumber = parseInt(lastWork.workId.split("-")[1], 10);
    newId = `WM-${String(lastNumber + 1).padStart(5, "0")}`;
  }

  return newId;
};

// ✅ Add New Work (Authenticated)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    console.log("📩 Work Data Received:", req.body); // Debugging

    const { title, description, startDate, deadline, workDescription, assignedEmployee, stages } = req.body;

    // ✅ Validate required fields
    if (!title || !description || !startDate || !deadline || !workDescription || !assignedEmployee) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // ✅ Ensure assignedEmployee is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignedEmployee)) {
      return res.status(400).json({ msg: "Invalid Employee ID" });
    }

    // ✅ Fetch employee details
    const employee = await Employee.findById(assignedEmployee);
    if (!employee) {
      return res.status(404).json({ msg: "Assigned employee not found" });
    }

    // ✅ Generate unique Work ID
    const workId = await generateWorkId();

    // ✅ Save new work entry
    const newWork = new Work({
      workId, // ✅ Unique auto-incrementing ID
      title,
      description,
      startDate,
      deadline,
      workDescription,
      assignedEmployee: new mongoose.Types.ObjectId(employee._id), // Ensure correct reference
      stages,
      organization: employee.organization || "Unknown", // ✅ Ensuring work is linked to the correct org
    });

    await newWork.save();
    res.status(201).json({ msg: "Work added successfully", work: newWork });
  } catch (error) {
    console.error("🚨 Work Creation Error:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Get All Works (Filtered by Organization)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.organization) {
      return res.status(403).json({ msg: "Unauthorized: Organization not found" });
    }

    const works = await Work.find({ organization: req.user.organization }) // ✅ Fetch work related to user's organization
      .populate("assignedEmployee", "name position email organization")
      .lean();

    res.json(works);
  } catch (error) {
    console.error("🚨 Error fetching works:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Get Work by ID
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

// ✅ Get Works Assigned to a Specific Employee
router.get("/employee/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate employee ID before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Employee ID" });
    }

    const works = await Work.find({ assignedEmployee: new mongoose.Types.ObjectId(id) })
      .populate("assignedEmployee", "name position email");

    if (!works.length) {
      return res.status(200).json([]); // Return empty array instead of 404
    }

    res.json(works);
  } catch (error) {
    console.error("🚨 Error fetching employee works:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;
