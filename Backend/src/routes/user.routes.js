import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const router = Router();
import { getUserProfile, registerUser, loginUser, logOutUser, forgotPassword, resetPassword } from "../controllers/user.controllers.js";

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", verifyjwt, getUserProfile)
router.post("/logout", verifyjwt, logOutUser)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)


export default router;

