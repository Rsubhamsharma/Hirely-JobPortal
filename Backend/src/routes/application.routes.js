import { Router } from "express";
import {
  applyToJob,
  getApplicationsForJob,
  getAppliedJobs,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import { verifyJWT, isRecruiter, isApplicant } from "../middlewares/auth.middleware.js";

const router = Router();

// applicant routes
router.route("/apply/:jobId").post(verifyJWT, isApplicant, applyToJob);
router.route("/applied-jobs").get(verifyJWT, isApplicant, getAppliedJobs);

// recruiter routes
router
  .route("/job/:jobId")
  .get(verifyJWT, isRecruiter, getApplicationsForJob);
router
  .route("/:applicationId")
  .patch(verifyJWT, isRecruiter, updateApplicationStatus);

export default router;
