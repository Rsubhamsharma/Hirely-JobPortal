import { Router } from "express";
import {
    createCompetiton, getCompetitionById,
    updateCompetition, deleteCompetition,
    getAllCompetitions, RegisterCompetition,
    getRegisteredApplicants

} from "../controllers/competition.controllers.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyjwt, getAllCompetitions)
router.post("/create", verifyjwt, createCompetiton)
router.get("/:competitionId", verifyjwt, getCompetitionById)
router.patch("/:competitionId", verifyjwt, updateCompetition)
router.delete("/:competitionId", verifyjwt, deleteCompetition)
router.post("/register/:competitionId", verifyjwt, RegisterCompetition)
router.get("/:competitionId/applicants", verifyjwt, getRegisteredApplicants)

export default router;