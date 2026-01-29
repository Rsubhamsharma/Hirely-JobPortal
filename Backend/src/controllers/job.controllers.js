import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudianry.js";
import Job from "../models/job.schema.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.schema.js";
import mongoose from "mongoose";
import Profile from "../models/profile.schema.js";
import { scrapeJobDescription } from "../services/scrape.service.js";
import * as aiService from "../services/ai.service.js";

const createJob = asyncHandler(async (req, res) => {
  const user = req.user
  if (user?.role !== "recruiter") {
    throw new ApiError(403, "Only recruiters can create jobs")
  }

  // Fetch recruiter's profile for company details
  const Profile = (await import("../models/profile.schema.js")).default;
  const profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    throw new ApiError(404, "Profile not found. Please create your profile first.");
  }

  const { title, description, location, salary, jobType, responsibilities, skills, experience } = req.body

  // Use company details from profile, allow override from request body
  const company = req.body.company || profile?.companyName || "";
  const companydetails = req.body.companydetails || profile?.aboutCompany || "";

  if (!company) {
    throw new ApiError(400, "Company name is required. Please update your profile with company details.");
  }

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
    status: "Active",
    profile: profile._id  // Use the fetched profile's ID
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
  if (!Array.isArray(skills)) {
    throw new ApiError(400, "Skills must be an array")
  }
  if (skills.length === 0) {
    throw new ApiError(400, "Skills array cannot be empty")
  }

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
    status: "active",
    profile: profile._id  // Use the fetched profile's ID
  })

  if (!job) {
    throw new ApiError(500, "Job creation failed")
  }

  res.status(201).json(new ApiResponse(201, job, "Job created successfully"))
})

const getJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params

  // Parse job ID to determine source
  const [source] = jobId.split("_");

  // Handle external jobs
  const externalSources = ["adzuna", "jsearch", "remotive"];
  if (externalSources.includes(source)) {
    const { getCachedData } = await import("../services/redis.service.js");
    const job = await getCachedData(`job:${jobId}`);

    if (!job) {
      throw new ApiError(404, "Job not found. It may have expired or was removed by the provider.");
    }

    return res.status(200).json(new ApiResponse(200, job, "External job fetched successfully"))
  }

  // Handle internal jobs (default)
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID format")
  }

  const job = await Job.findById(jobId)
    .populate({
      path: "postedBy",
      select: "fullname email role"
    })
    .populate({
      path: "profile",
      select: "profileimage companyName companyLogo aboutCompany"
    })

  if (!job) {
    throw new ApiError(404, "Job not found")
  }

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

  const job = await Job.findById(jobId).populate("postedBy", "fullname email role")

  if (!job) throw new ApiError(404, "Job not found")


  if (job.postedBy._id.toString() !== user._id.toString()) {
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

  const job = await Job.findOne({ _id: jobId, postedBy: userId }).populate("postedBy", "fullname email role");

  if (!job) {
    throw new ApiError(404, "Job not found or unauthorized");
  }

  if (job.status === "closed") {
    throw new ApiError(400, "Job is already closed");
  }

  job.status = "closed";
  await job.save();

  return res.status(200).json(new ApiResponse(200, job, "Job closed successfully"));
});

const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  const job = await Job.findOne({ _id: jobId, postedBy: userId });

  if (!job) {
    throw new ApiError(404, "Job not found or unauthorized");
  }

  await Job.findByIdAndDelete(jobId);

  return res.status(200).json(new ApiResponse(200, {}, "Job deleted successfully"));
});

const toggleJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  const job = await Job.findOne({ _id: jobId, postedBy: userId }).populate({
    path: "postedBy",
    select: "fullname email role",
    populate: {
      path: "profile",
      select: "profileimage companyName companyLogo aboutCompany"
    }
  });

  if (!job) {
    throw new ApiError(404, "Job not found or unauthorized");
  }

  // Toggle between active and inactive
  job.status = job.status === "active" ? "inactive" : "active";
  await job.save();

  return res.status(200).json(new ApiResponse(200, job, `Job marked as ${job.status} successfully`));
});

const getAllJobs = asyncHandler(async (req, res) => {
  try {
    // Import aggregator service
    const { aggregateJobs } = await import("../services/jobAggregator.service.js");

    // Extract query parameters (already validated by middleware)
    const { keyword, location, type, source, page, limit } = req.query;

    // Use job aggregator to fetch and combine jobs
    const result = await aggregateJobs({
      keyword,
      location,
      type: type || "",
      source: source || "",
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    return res.status(200).json(
      new ApiResponse(200, result, "Jobs fetched successfully")
    );
  } catch (error) {
    // Fallback: Query database directly
    try {
      const { keyword, location, type, page = 1, limit = 20 } = req.query;

      const query = { status: { $ne: "closed" } };

      if (keyword) {
        query.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } }
        ];
      }

      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      if (type) {
        query.jobType = type;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [jobs, total] = await Promise.all([
        Job.find(query)
          .populate({
            path: "postedBy",
            select: "fullname email role"
          })
          .populate({
            path: "profile",
            select: "profileimage companyName companyLogo aboutCompany"
          })
          .limit(parseInt(limit))
          .skip(skip)
          .sort({ createdAt: -1 })
          .lean(),
        Job.countDocuments(query)
      ]);

      const result = {
        jobs: jobs.map(job => ({
          ...job,
          id: job._id.toString(),
          source: "internal"
        })),
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      };

      // Fallback query successful

      return res.status(200).json(
        new ApiResponse(200, result, "Jobs fetched successfully (fallback mode)")
      );
    } catch (fallbackError) {
      // Fallback query also failed
      throw new ApiError(500, "Failed to fetch jobs");
    }
  }
});

const trackJobClick = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // Import JobClick model
  const JobClick = (await import("../models/jobClick.schema.js")).default;

  // Parse job ID to determine source
  const [source] = jobId.split("_");

  // Validate source
  const validSources = ["internal", "adzuna", "jsearch", "remotive"];
  if (!validSources.includes(source)) {
    throw new ApiError(400, "Invalid job source");
  }

  // Get IP and user agent
  const ip = req.ip || req.connection.remoteAddress || "";
  const userAgent = req.get("user-agent") || "";

  // Log the click (don't await - fire and forget)
  JobClick.create({
    jobId,
    source,
    ip,
    userAgent
  }).catch(() => { }); // Fire and forget, ignore logging in prod for this

  // Get external job URL
  let redirectUrl = null;

  if (source === "internal") {
    // For internal jobs, redirect to job detail page
    const internalId = jobId.replace("internal_", "");
    redirectUrl = `${process.env.CORS_ORIGIN}/jobs/${internalId}`;
  } else {
    // For external jobs, we need to get the URL from cache or reconstruct it
    // This is a simplified version - in production, you'd want to cache full job data
    const { getExternalJobUrl } = await import("../services/jobAggregator.service.js");
    redirectUrl = await getExternalJobUrl(jobId);

    if (!redirectUrl) {
      // Fallback: construct generic URLs based on provider
      const [provider, ...idParts] = jobId.split("_");
      const originalId = idParts.join("_");

      switch (provider) {
        case "remotive":
          redirectUrl = `https://remotive.com/remote-jobs/${originalId}`;
          break;
        case "adzuna":
          redirectUrl = `https://www.adzuna.com/details/${originalId}`;
          break;
        case "jsearch":
          // JSearch doesn't have a direct URL pattern
          throw new ApiError(404, "Job URL not found. Please search for the job again.");
        default:
          throw new ApiError(404, "Job not found");
      }
    }
  }

  if (!redirectUrl) {
    throw new ApiError(404, "Job URL not found");
  }

  // Redirect to the job URL
  return res.redirect(302, redirectUrl);
});

/**
 * Scrape full job description from external job URL
 * For jobs from Adzuna and other aggregators that only provide short snippets
 */
const scrapeFullJobDescription = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // Parse job ID to determine source
  const [source] = jobId.split("_");

  // Only allow scraping for external jobs
  const externalSources = ["adzuna", "jsearch", "remotive"];
  if (!externalSources.includes(source)) {
    throw new ApiError(400, "Scraping only available for external jobs");
  }

  // Get the job data directly from cache to get the real externalUrl
  const { getCachedData } = await import("../services/redis.service.js");
  const cachedJob = await getCachedData(`job:${jobId}`);

  let externalUrl = null;

  if (cachedJob && cachedJob.externalUrl) {
    externalUrl = cachedJob.externalUrl;
  } else {
    // Fallback: try to construct URL from provider patterns
    const { getExternalJobUrl } = await import("../services/jobAggregator.service.js");
    externalUrl = await getExternalJobUrl(jobId);
  }

  if (!externalUrl) {
    return res.status(200).json(
      new ApiResponse(200, {
        description: null,
        scraped: false,
        message: "External job URL not found in cache"
      }, "Scraping not available for this job")
    );
  }

  // Try to scrape first
  let description = await scrapeJobDescription(externalUrl);
  let scraped = !!description;

  if (!description || description.length < 1200) {

    // Use cachedJob if available, or construct basic data from ID
    // Adzuna IDs are usually numbers, so we try to provide a generic but professional context
    const expansionData = {
      title: cachedJob?.title || "Professional Role",
      company: cachedJob?.company || "Premier Employer",
      description: description || cachedJob?.description || "Snippet not available",
      location: cachedJob?.location || "Remote",
      source: source
    };

    description = await aiService.generateFullDescription(expansionData);
    scraped = false; // Mark as AI enhanced, not scraped
  }

  return res.status(200).json(
    new ApiResponse(200, {
      description,
      scraped,
      aiEnhanced: !scraped,
      url: externalUrl
    }, scraped ? "Full description fetched successfully" : "Job description enhanced with AI")
  );
});

export { createJob, getJobById, editJob, closeJob, deleteJob, toggleJobStatus, getAllJobs, trackJobClick, scrapeFullJobDescription }
