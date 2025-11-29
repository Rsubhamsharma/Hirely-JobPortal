import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const router = Router();
import { getUserProfile,registerUser,loginUser,logOutUser} from "../controllers/user.controllers.js";

router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/profile:id",verifyjwt,getUserProfile)
router.post("/logout",verifyjwt,logOutUser)


export default router;

