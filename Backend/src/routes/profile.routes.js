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
} from "../controllers/profile.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

// Base profile routes
router.put("/me",verifyjwt,upload.fields([{name:"resume",maxCount:1},{name:"profileimage",maxCount:1}]),createOrUpdateProfile)
router.get("/me",verifyjwt,getProfile)

// Experience sub-resource routes
 // Use POST to add a new experience
router.patch("/me/experience/:experienceId",verifyjwt,changeExperience)
router.delete("/me/experience/:experienceId",verifyjwt,removeExperience)

router.patch("/me/skills",verifyjwt,addSkills)
router.delete("/me/skills/:skill", verifyjwt, removeSkill)
router.delete("/me/skills", verifyjwt, removeSkill)

// Education sub-resource routes
router.post("/me/education",verifyjwt,addEducation) // Use POST to add new education
router.delete("/me/education/:educationId",verifyjwt,removeEducation)

export default router;