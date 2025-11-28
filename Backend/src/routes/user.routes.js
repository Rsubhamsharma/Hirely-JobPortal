import { Router } from "express";
const router = Router();
import { getUserProfile,registerUser,loginUser } from "../controllers/user.controllers.js";

router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/profile",getUserProfile)

export default router;

