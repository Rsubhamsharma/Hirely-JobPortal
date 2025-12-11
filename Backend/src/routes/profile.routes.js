import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import {
  createOrUpdateProfile,
  getProfile,
  changeExperience,
  addSkills,
  addEducation,
  removeExperience,
  removeEducation,
  removeSkill,
   changeEducation,
  getProfileById,
   uploadResume
} from "../controllers/profile.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

// Base profile routes
router.put("/me",verifyjwt,upload.fields([{name:"resume",maxCount:1},{name:"profileimage",maxCount:1}]),createOrUpdateProfile)
router.get("/me",verifyjwt,getProfile)
router.get("/user/:userId",verifyjwt,getProfileById)
router.post("/me/resume", verifyjwt, upload.single("resume"), uploadResume);


// Experience sub-resource routes
 // Use POST to add a new experience
router.patch("/me/experience/:experienceId",verifyjwt,changeExperience)
router.delete("/me/experience/:experienceId",verifyjwt,removeExperience)

router.patch("/me/skills",verifyjwt,addSkills)
router.delete("/me/skills/:skill", verifyjwt, removeSkill)
router.delete("/me/skills", verifyjwt, removeSkill)

// Education sub-resource routes
router.post("/me/education",verifyjwt,addEducation)
router.delete("/me/education/:educationId",verifyjwt,removeEducation)
router.patch("/me/education/:educationId",verifyjwt,changeEducation)


export default router;