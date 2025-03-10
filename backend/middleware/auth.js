const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

module.exports = async (req, res, next) => {
  try {
    // ✅ 1. Get token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    // ✅ 2. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 3. Check if the user is an Admin or Employee
    let user = await User.findById(decoded.id).select("-password"); // Exclude password
    if (!user) {
      user = await Employee.findById(decoded.id).select("-password"); // Check in employees
    }

    if (!user) {
      return res.status(401).json({ msg: "Unauthorized: User not found" });
    }

    req.user = user; // ✅ Attach user/employee data to request
    next(); // Proceed to the next middleware

  } catch (error) {
    console.error("🚨 Auth Middleware Error:", error);
    res.status(401).json({ msg: "Unauthorized: Invalid token" });
  }
};
