import mongoose from "mongoose";
import competitionsSchema from "../models/competitions.schema.js";


import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createCompetiton = asyncHandler(async (req, res) => {
    const { title, date, prize, status } = req.body
    if ([title, date, status].some((field) => field?.trim() == "")) {
        throw new ApiError(400, "All fields are required")
    }
    const competition = await competitionsSchema.create({
        title,
        organizer: req.user._id,
        date,
        prize,
        status

    })
    return res.status(200).json(new ApiResponse(200, competition, "competition created successfully"))
}
)
const getCompetitionById = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    if (!mongoose.isValidObjectId(competitionId)) {

        throw new ApiError(400, "Invalid Id")
    }
    const competition = await competitionsSchema.findById(competitionId).populate("organizer", "fullname email role ")
    if (!competition) {
        throw new ApiError(404, "Competition not found ")
    }
    return res.status(200).json(new ApiResponse(200, competition, "competition fetched successfully"))

})
const updateCompetition = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    const { title, date, prize, status } = req.body

    if (!mongoose.isValidObjectId(competitionId)) {
        throw new ApiError(400, "Invalid competition Id")
    }
    const competition = await competitionsSchema.findByIdAndUpdate({ _id: competitionId },
        {
            $set: {
                title,
                status,
                date,
                prize

            }
        }, { new: true }).populate("organizer", "fullname email role ")
    if (!competition) {
        throw new ApiError(404, "Competition not found")
    }
    return res.status(200).json(new ApiResponse(200, competition, "competition updated successfully"))
})
const deleteCompetition = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    if (!mongoose.isValidObjectId(competitionId)) {
        throw new ApiError(400, "Invalid competiton Id")
    }
    const competition = await competitionsSchema.findByIdAndDelete(competitionId).populate("organizer", "fullname email role ")
    if (!competition) throw new ApiError(404, "Competiton not found")
    return res.status(200).json(new ApiResponse(200, {}, "Competition deleted successfully"))
})
const getAllCompetitions = asyncHandler(async (req, res) => {
    const competitions = await competitionsSchema.find().populate("organizer", "fullname email role ")
    if (competitions.length === 0) {
        throw new ApiError(404, "Competitions not found or no competitions available ")
    }
    return res.status(200).json(new ApiResponse(200, competitions, "Competitions fetched successfully "))
})


export { createCompetiton, getCompetitionById, updateCompetition, deleteCompetition, getAllCompetitions }