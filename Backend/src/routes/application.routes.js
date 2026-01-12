import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { authorise } from "../middlewares/authorizeRole.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    applyToJob,
    getApplicationsByJob,
    getMyApplications,
    updateApplicationStatus,
    getApplicationById
} from "../controllers/application.controllers.js";

const router = Router();

// Applicant routes
router.post(
    "/apply/:jobId",
    verifyjwt,
    authorise("applicant"),
    upload.single("resume"),
    applyToJob
);
router.get("/my", verifyjwt, authorise("applicant"), getMyApplications);

// Recruiter routes
router.get("/job/:jobId", verifyjwt, authorise("recruiter"), getApplicationsByJob);
router.patch("/:applicationId/status", verifyjwt, authorise("recruiter"), updateApplicationStatus);

// Shared route (both can access based on their role)
router.get("/:applicationId", verifyjwt, getApplicationById);

export default router;
