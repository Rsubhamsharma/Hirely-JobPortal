import Job from "../models/job.schema.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createJob = asyncHandler(async (req, res) => {
  const { title, description, company, location, salary, jobType } = req.body;

  if ([title, description, company, location, jobType].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const job = await Job.create({
    title,
    description,
    company,
    location,
    salary,
    jobType,
    postedBy: req.user._id,
  });

  if (!job) {
    throw new ApiError(500, "Something went wrong while creating the job");
  }

  return res.status(201).json(new ApiResponse(201, job, "Job created successfully"));
});

const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find();
  return res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  return res.status(200).json(new ApiResponse(200, job, "Job fetched successfully"));
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  return res.status(200).json(new ApiResponse(200, job, "Job updated successfully"));
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Job deleted successfully"));
});

export { createJob, getAllJobs, getJobById, updateJob, deleteJob };
