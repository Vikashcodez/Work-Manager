const express = require("express");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee"); 
const User = require("../models/User"); // ✅ Import User model to fetch organization
const authMiddleware = require("../middleware/auth"); // ✅ Protect routes

const router = express.Router();

// ✅ Add Employee Route (Only Admin Can Add)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, employeeId, position, email, password } = req.body;

    // ✅ 1. Ensure the Admin is logged in
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ msg: "Unauthorized: Only admins can add employees" });
    }

    // ✅ 2. Check if Employee email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ msg: "Employee email already registered." });
    }

    // ✅ 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. Create Employee Entry (Auto-fetch organization)
    const newEmployee = new Employee({
      name,
      employeeId,
      position,
      email,
      password: hashedPassword,
      organization: admin.organization, // ✅ Automatically assign the admin's organization
      createdBy: admin._id, // ✅ Store admin ID
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

module.exports = router;
