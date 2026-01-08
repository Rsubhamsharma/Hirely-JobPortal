import { Router } from "express";
import { createCompetiton ,getCompetitionById,
    updateCompetition,deleteCompetition,
    getAllCompetitions

} from "../controllers/competition.controllers.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router()



router.post("/create",verifyjwt,createCompetiton)
router.get("/:competitionId",verifyjwt,getCompetitionById)
router.patch("/:competitionId",verifyjwt,updateCompetition)
router.delete("/:competitionId",verifyjwt,deleteCompetition)
router.get("/",verifyjwt,getAllCompetitions)

export default router;