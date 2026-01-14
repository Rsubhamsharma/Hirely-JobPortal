import mongoose from "mongoose";
import Application from "../models/application.schema.js";
import Job from "../models/job.schema.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudianry.js";
import { sendJobApplicationEmail, sendStatusUpdateEmail } from "../services/emailService.js";

/**
 * Apply to a job (Applicant only)
 * POST /applications/apply/:jobId
 */
const applyToJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Check if user is an applicant
    if (req.user.role !== "applicant") {
        throw new ApiError(403, "Only applicants can apply to jobs");
    }

    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid job ID");
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }
    if (job.status !== "active") {
        throw new ApiError(400, "This job is no longer accepting applications");
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
        job: jobId,
        applicant: userId
    });
    if (existingApplication) {
        throw new ApiError(400, "You have already applied to this job");
    }

    // Get application data from request body
    const { coverLetter, phone, expectedSalary, experience } = req.body;

    if (!phone) {
        throw new ApiError(400, "Phone number is required");
    }

    // Handle resume upload
    let resumeUrl = "";
    if (req.file) {
        try {
            const uploadResult = await uploadCloudinary(req.file.buffer, "resumes");
            resumeUrl = uploadResult.secure_url;
        } catch (uploadErr) {
            console.error("Resume upload error:", uploadErr);
            throw new ApiError(500, "Failed to upload resume");
        }
    } else if (req.body.resumeUrl) {
        // If user provides an existing resume URL
        resumeUrl = req.body.resumeUrl;
    } else {
        throw new ApiError(400, "Resume is required");
    }

    // Create application
    const application = await Application.create({
        job: jobId,
        applicant: userId,
        resume: resumeUrl,
        coverLetter: coverLetter || "",
        phone,
        expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
        experience: experience || "",
        status: "Applied"
    });

    // Add application reference to job
    await Job.findByIdAndUpdate(jobId, {
        $push: { applications: application._id }
    });

    // Populate and return
    await application.populate("job", "title company location");
    await application.populate("applicant", "fullname email");

    // Send application confirmation email (async, don't block response)
    sendJobApplicationEmail(req.user, job).catch(err =>
        console.error('Failed to send application email:', err)
    );

    return res.status(201).json(
        new ApiResponse(201, application, "Application submitted successfully")
    );
});

/**
 * Get all applications for a specific job (Recruiter only)
 * GET /applications/job/:jobId
 */
const getApplicationsByJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid job ID");
    }

    // Check if job exists and belongs to this recruiter
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }
    if (job.postedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only view applications for your own jobs");
    }

    // Get all applications for this job
    const applications = await Application.find({ job: jobId })
        .populate("applicant", "fullname email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, applications, "Applications fetched successfully")
    );
});

/**
 * Get my applications (Applicant only)
 * GET /applications/my
 */
const getMyApplications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (req.user.role !== "applicant") {
        throw new ApiError(403, "Only applicants can view their applications");
    }

    const applications = await Application.find({ applicant: userId })
        .populate("job", "title company location salary jobType status")
        .populate("applicant", "fullname email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, applications, "Your applications fetched successfully")
    );
});

/**
 * Update application status (Recruiter only)
 * PATCH /applications/:applicationId/status
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate applicationId
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        throw new ApiError(400, "Invalid application ID");
    }

    // Validate status
    const validStatuses = ["Applied", "Viewed", "Shortlisted", "Rejected", "Hired"];
    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    // Get application and check ownership
    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    // Check if the job belongs to this recruiter
    if (application.job.postedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only update applications for your own jobs");
    }

    // Update status
    application.status = status;
    await application.save();

    await application.populate("applicant", "fullname email");

    // Send status update email (async)
    sendStatusUpdateEmail(application.applicant, application.job, status).catch(err =>
        console.error("Failed to send status update email:", err)
    );

    return res.status(200).json(
        new ApiResponse(200, application, "Application status updated successfully")
    );
});

/**
 * Get single application details
 * GET /applications/:applicationId
 */
const getApplicationById = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        throw new ApiError(400, "Invalid application ID");
    }

    const application = await Application.findById(applicationId)
        .populate("job", "title company location salary jobType postedBy")
        .populate("applicant", "fullname email");

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    // Check authorization - either the applicant or the job poster can view
    const isApplicant = application.applicant._id.toString() === userId.toString();
    const isRecruiter = application.job.postedBy.toString() === userId.toString();

    if (!isApplicant && !isRecruiter) {
        throw new ApiError(403, "You are not authorized to view this application");
    }

    return res.status(200).json(
        new ApiResponse(200, application, "Application fetched successfully")
    );
});

export {
    applyToJob,
    getApplicationsByJob,
    getMyApplications,
    updateApplicationStatus,
    getApplicationById
};
