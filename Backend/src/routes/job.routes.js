import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import{createJob,getJobById,editJob,deleteJob} from "../controllers/job.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
const router = Router();
router.post("/postjob",verifyjwt,createJob)
router.get("/getjob/:jobId",getJobById)

router.patch("/job/:jobId",verifyjwt,editJob).delete("/job/:jobId",verifyjwt,deleteJob)
export default router