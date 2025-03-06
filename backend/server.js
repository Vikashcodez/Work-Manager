require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees"); // ✅ Add Employee Routes
require("./config/passport"); // Import Passport config

const app = express();

// 🔥 CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allows frontend to send cookies
  })
);

app.use(express.json());
app.use(cookieParser()); // ✅ Parse cookies for authentication

// 🔥 Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// 🔥 Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// 🔥 Routes
app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes); // ✅ New Employee Routes

// 🔥 Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
