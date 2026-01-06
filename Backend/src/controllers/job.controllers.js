import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudianry.js";
import Job from "../models/job.schema.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.schema.js";
import mongoose from "mongoose";

const createJob = asyncHandler(async (req, res) => {
  const user = req.user
  if (user?.role !== "recruiter") {
    throw new ApiError(403, "Only recruiters can create jobs")
  }
  const { title, description, company, location, salary, jobType, companydetails, responsibilities, skills, experience } = req.body
  const fields = {
    title,
    description,
    company,
    location,
    salary,
    jobType,
    companydetails,
    responsibilities,
    experience,
    skills,
    postedBy: req.user._id,
    status: "Active"
  };

  for (const [key, value] of Object.entries(fields)) {

    // If field is missing entirely
    if (value === undefined || value === null) {
      throw new ApiError(400, `${key} is required`);
    }

    // If field is a string, check trimmed empty
    if (typeof value === "string" && value.trim() === "") {
      throw new ApiError(400, `${key} cannot be empty`);
    }

    // If field is an array, check non-empty
    if (Array.isArray(value) && value.length === 0) {
      throw new ApiError(400, `${key} must have at least one item`);
    }

    // If it's a number, ensure it's valid
    if (typeof value === "number" && isNaN(value)) {
      throw new ApiError(400, `${key} must be a valid number`);
    }
  }


  if (isNaN(salary)) {
    throw new ApiError(400, "Salary must be a number")
  }
  if (!Array.isArray(skills)) { throw new ApiError(400, "Skills must be an array") }
  if (skills.length === 0) { throw new ApiError(400, "Skills array cannot be empty") }
  const sanitizedSkills = skills.filter(
    s => typeof s === "string" && s.trim() !== ""
  )

  const job = await Job.create({
    title,
    description,
    company,
    location,
    salary,
    companydetails,
    responsibilities,
    jobType,
    skills: sanitizedSkills,
    experience,
    postedBy: req.user._id,
    status: "active"
  })
  if (!job) { throw new ApiError(500, "Job creation failed") }
  res.status(201).json(new ApiResponse(201, job, "Job created successfully"))

})
const getJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID format")
  }
  const job = await Job.findById(jobId).populate("postedBy", "fullname email")
  if (!job) { throw new ApiError(404, "Job not found") }
  return res.status(200).json(new ApiResponse(200, job, "Job fetched successfully"))
})

const editJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params
  const user = req.user

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID format")
  }

  if (user.role !== "recruiter") {
    throw new ApiError(403, "Only recruiters can edit jobs")
  }

  const allowedFields = [
    "title",
    "description",
    "company",
    "location",
    "salary",
    "companydetails",
    "responsibilities",
    "skills",
    "experience",
    "jobType"
  ]

  const updates = {}

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      const val = req.body[field]

      if (typeof val === "string") {
        const trimmed = val.trim()
        if (trimmed !== "") updates[field] = trimmed
      }
      else if (Array.isArray(val)) {
        const cleaned = val
          .map(v => String(v).trim())
          .filter(Boolean)

        if (cleaned.length > 0) updates[field] = cleaned
      }
      else if (val !== undefined) {
        updates[field] = val
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No update fields provided")
  }

  if (updates.salary !== undefined) {
    const n = Number(updates.salary)
    if (Number.isNaN(n)) {
      throw new ApiError(400, "Salary must be a number")
    }
    updates.salary = n
  }

  const job = await Job.findById(jobId)

  if (!job) throw new ApiError(404, "Job not found")


  if (job.postedBy.toString() !== user._id.toString()) {
    throw new ApiError(403, "You can update only your own jobs")
  }

  Object.assign(job, updates)
  await job.save()

  await job.populate("postedBy", "fullname email")

  return res
    .status(200)
    .json(new ApiResponse(200, job, "Job updated successfully"))
})

const closeJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  const job = await Job.findOne({ _id: jobId, postedBy: userId });

  if (!job) {
    throw new ApiError(404, "Job not found or unauthorized");
  }

  if (job.status === "closed") {
    throw new ApiError(400, "Job is already closed");
  }

  job.status = "closed";
  await job.save();

  return res
    .status(200)
    .json(new ApiResponse(200, job, "Job closed successfully"));
});

const getAllJobs = asyncHandler(async (req, res) => {
  // Optionally add filters (e.g., ?search=developer)
  const { search, location, jobType } = req.query;

  const query = { status: "active" }; // Only fetch active jobs

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }
  if (jobType) {
    query.jobType = jobType;
  }

  const jobs = await Job.find(query).populate("postedBy", "fullname email profileimage company");

  return res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

export { createJob, getJobById, editJob, closeJob, getAllJobs }