const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true }, // <-- use username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  city: { type: String },
  role: { type: String, enum: ["jobseeker", "recruiter"], default: "jobseeker" },
  skills: { type: String },
  resume: { type: String }, // uploaded file name
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
