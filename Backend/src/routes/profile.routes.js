import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { createOrUpdateProfile } from "../controllers/profile.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.put("/me",verifyjwt,upload.single("resume"),createOrUpdateProfile)

export default router;