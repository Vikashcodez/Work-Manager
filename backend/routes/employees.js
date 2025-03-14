const express = require("express");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ✅ Add Employee (Only Admin Can Add)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, employeeId, position, email, password } = req.body;

    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ msg: "Unauthorized: Only admins can add employees" });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ msg: "Employee email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      name,
      employeeId,
      position,
      email,
      password: hashedPassword,
      organization: admin.organization,
      createdBy: admin._id,
      blocked: false, // ✅ Default: employee is active
    });

    await newEmployee.save();
    res.status(201).json({ msg: "Employee added successfully" });
  } catch (error) {
    console.error("🚨 Employee Registration Error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Get All Employees (Admin Only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }

    const employees = await Employee.find({ organization: admin.organization });
    res.json(employees);
  } catch (error) {
    console.error("🚨 Fetch Employees Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Delete Employee (Admin Only)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ msg: "Unauthorized: Only admins can delete employees" });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    await employee.deleteOne();
    res.json({ msg: "Employee deleted successfully" });
  } catch (error) {
    console.error("🚨 Delete Employee Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ FIXED: Block/Unblock Employee (Admin Only)
router.put("/block/:id", authMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ msg: "Unauthorized: Only admins can block/unblock employees" });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    // ✅ Toggle block status
    employee.blocked = !employee.blocked;
    await employee.save();

    res.json({ msg: employee.blocked ? "Employee blocked successfully" : "Employee unblocked successfully" });
  } catch (error) {
    console.error("🚨 Block/Unblock Employee Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
