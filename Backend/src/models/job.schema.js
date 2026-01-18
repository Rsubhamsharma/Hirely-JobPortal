import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        default: [],
      },
    ],
    salary: {
      type: Number,
    },
    companydetails: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "closed", "inactive"]
    },
    isvisible: {
      type: Boolean,
      default: true
    },
    responsibilities: {
      type: String,
      default: ""
    },
    skills: [{
      type: String,
      default: ""
    }],

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",

    }
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
