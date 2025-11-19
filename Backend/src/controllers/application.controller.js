import Application from "../models/application.schema.js";
import Job from "../models/job.schema.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const applicantId = req.user._id;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: applicantId,
  });

  if (existingApplication) {
    throw new ApiError(400, "You have already applied to this job");
  }

  const application = await Application.create({
    job: jobId,
    applicant: applicantId,
  });

  if (!application) {
    throw new ApiError(500, "Something went wrong while applying to the job");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, application, "Applied to job successfully"));
});

const getApplicationsForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const applications = await Application.find({ job: jobId }).populate(
    "applicant",
    "name email"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, applications, "Applications fetched successfully")
    );
});

const getAppliedJobs = asyncHandler(async (req, res) => {
  const applicantId = req.user._id;
  const applications = await Application.find({ applicant: applicantId }).populate(
    "job"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        applications,
        "Applied jobs fetched successfully"
      )
    );
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const application = await Application.findByIdAndUpdate(
    applicationId,
    { status },
    { new: true }
  );

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, application, "Application status updated successfully")
    );
});

export {
  applyToJob,
  getApplicationsForJob,
  getAppliedJobs,
  updateApplicationStatus,
};
