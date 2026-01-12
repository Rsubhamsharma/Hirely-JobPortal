import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    // Application details
    resume: {
      type: String, // URL or file path to resume
      required: true,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
    },
    expectedSalary: {
      type: Number,
    },
    experience: {
      type: String, // e.g., "2-3 years"
      default: "",
    },
    status: {
      type: String,
      enum: ["Applied", "Viewed", "Shortlisted", "Rejected", "Hired"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;

