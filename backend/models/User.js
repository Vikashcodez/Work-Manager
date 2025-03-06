const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // ✅ Sparse index allows multiple null values
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google login
  organization: { type: String, required: true },
  position: { type: String, required: true },
  address: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
