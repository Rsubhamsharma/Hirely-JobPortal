import { Router } from "express";
import { authorise } from "../middlewares/authorizeRole.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { createJob, getJobById, editJob, closeJob, deleteJob, toggleJobStatus, getAllJobs } from "../controllers/job.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
const router = Router();

router.get("/", getAllJobs); // Get all jobs public route

router.post("/postjob", verifyjwt, authorise("recruiter"), createJob)
router.get("/getjob/:jobId", getJobById)

router.patch("/job/:jobId", verifyjwt, authorise("recruiter"), editJob)
router.post("/job/:jobId/close", verifyjwt, authorise("recruiter"), closeJob)
router.delete("/job/:jobId", verifyjwt, authorise("recruiter"), deleteJob)
router.patch("/job/:jobId/toggle-status", verifyjwt, authorise("recruiter"), toggleJobStatus)

export default router