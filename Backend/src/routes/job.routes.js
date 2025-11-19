import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { verifyJWT, isRecruiter } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllJobs);
router.route("/:id").get(getJobById);

// protected routes for recruiters
router.route("/").post(verifyJWT, isRecruiter, createJob);
router.route("/:id").patch(verifyJWT, isRecruiter, updateJob);
router.route("/:id").delete(verifyJWT, isRecruiter, deleteJob);

export default router;
