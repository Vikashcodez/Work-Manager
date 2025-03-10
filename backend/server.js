require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const workRoutes = require("./routes/work"); // ✅ Added Work Routes
require("./config/passport"); // Import Passport config

const app = express();

// ✅ Middleware Configuration
app.use(express.json());
app.use(cookieParser()); // ✅ Parse cookies for authentication

// 🔥 CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allows frontend to send cookies
  })
);

// 🔥 Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure only in production (HTTPS)
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    },
  })
);

// 🔥 Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/works", workRoutes); // ✅ Work Management Route

// ✅ Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ msg: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
