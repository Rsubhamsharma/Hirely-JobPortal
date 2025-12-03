import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { createOrUpdateProfile,getProfile,
    changeExperience,addSkills,addEducation} from "../controllers/profile.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.put("/me",verifyjwt,upload.fields([{name:"resume",maxCount:1},{name:"profileimage",maxCount:1}]),createOrUpdateProfile)
router.get("/me",verifyjwt,getProfile)
router.patch("/me/experience/:experienceId",verifyjwt,changeExperience)
router.patch("/me/skills",verifyjwt,addSkills)
router.patch("/me/education",verifyjwt,addEducation)


export default router;