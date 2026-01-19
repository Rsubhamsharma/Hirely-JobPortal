import mongoose from "mongoose";
import competitionsSchema from "../models/competitions.schema.js";


import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Profile from "../models/profile.schema.js";

import { getIO } from "../socket/socket.js";
import { sendCompetitionRegistrationEmail, sendCompetitionClosedEmail } from "../services/emailService.js";


const createCompetiton = asyncHandler(async (req, res) => {
    const { title, date, prize, status } = req.body
    if ([title, date, prize].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required ")
    }

    // Check if user has a profile
    if (!req.user.profile) {
        throw new ApiError(400, "Please create a profile before creating a competition. If you have a profile, try logging out and logging back in.")
    }

    console.log("Creating competition with profile:", req.user.profile);

    const competition = await competitionsSchema.create(
        {
            title,
            date,
            prize,
            status,
            organizer: req.user._id,
            profile: req.user.profile
        }
    )
    if (!competition) {
        throw new ApiError(500, "something went wrong while creating competition  ")
    }

    console.log("Competition created:", competition);

    // Emit real-time update
    const io = getIO();
    io.emit("competition_updated", { type: "create", competitionId: competition._id });

    return res.status(200).json(new ApiResponse(200, competition, "competition created successfully "))
})

const getCompetitionById = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    if (!mongoose.isValidObjectId(competitionId)) {

        throw new ApiError(400, "Invalid Id")
    }
    const competition = await competitionsSchema.findById(competitionId)
        .populate({
            path: "organizer",
            select: "fullname email role"
        })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })
        .populate("applicants", "fullname email")
    const isRegistered = competition.applicants.some(
        (applicant) => applicant._id.toString() === req.user._id.toString()
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            { ...competition.toObject(), isRegistered },
            "competition fetched successfully"
        )
    )
})
const updateCompetition = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    const { title, date, prize, status } = req.body

    if (!mongoose.isValidObjectId(competitionId)) {
        throw new ApiError(400, "Invalid competition Id")
    }

    // Get the old competition to check if status is changing to 'closed'
    const oldCompetition = await competitionsSchema.findById(competitionId)
        .populate({
            path: "organizer",
            select: "fullname email role"
        })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })
        .populate({
            path: "applicants",
            select: "fullname email"
        });
    const wasOpen = oldCompetition && oldCompetition.status !== "closed";
    const isClosing = status === "closed" && wasOpen;

    const competition = await competitionsSchema.findByIdAndUpdate({ _id: competitionId },
        {
            $set: {
                title,
                status,
                date,
                prize

            }
        }, { new: true }).populate({
            path: "organizer",
            select: "fullname email role"
        })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })
    if (!competition) {
        throw new ApiError(404, "Competition not found")
    }

    // Send closing emails to all applicants if competition is being closed
    if (isClosing && oldCompetition.applicants.length > 0) {
        oldCompetition.applicants.forEach(applicant => {
            sendCompetitionClosedEmail(applicant, competition).catch(err =>
                console.error(`Failed to send closing email to ${applicant.email}:`, err)
            );
        });
    }

    // Emit real-time update
    getIO().emit("competition_updated", { type: "update", competitionId });

    return res.status(200).json(new ApiResponse(200, competition, "Competition updated successfully"))
})
const deleteCompetition = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    if (!mongoose.isValidObjectId(competitionId)) {
        throw new ApiError(400, "Invalid competiton Id")
    }
    const competition = await competitionsSchema.findByIdAndDelete(competitionId)
        .populate({
            path: "organizer",
            select: "fullname email role"
        })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })
    if (!competition) throw new ApiError(404, "Competiton not found")

    // Emit real-time update
    getIO().emit("competition_updated", { type: "delete", competitionId });

    return res.status(200).json(new ApiResponse(200, {}, "Competition deleted successfully"))
})
const getAllCompetitions = asyncHandler(async (req, res) => {
    const competitions = await competitionsSchema.find()
        .sort({ createdAt: -1 }) // Most recent first
        .populate({
            path: "organizer",
            select: "fullname email role"
        })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })
    if (competitions.length === 0) {
        throw new ApiError(404, "Competitions not found or no competitions available ")
    }
    const competitionsWithStatus = competitions.map(comp => {
        const isRegistered = comp.applicants.some(
            (applicantId) => applicantId.toString() === req.user._id.toString()
        );
        return { ...comp.toObject(), isRegistered };
    });

    return res.status(200).json(new ApiResponse(200, competitionsWithStatus, "Competitions fetched successfully "))
})

const RegisterCompetition = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    if (!mongoose.isValidObjectId(competitionId)) {
        throw new ApiError(400, "Invalid competition Id")
    }

    // Check if already registered
    const existingCompetition = await competitionsSchema.findById(competitionId)
        .populate({
            path: "organizer",
            select: "fullname email role"
        })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })
    if (!existingCompetition) {
        throw new ApiError(404, "Competition not found")
    }

    if (existingCompetition.applicants.includes(req.user._id)) {
        throw new ApiError(400, "You have already registered for this competition")
    }

    // Use $addToSet to add user to applicants array (prevents duplicates)
    const competition = await competitionsSchema.findByIdAndUpdate(
        competitionId,
        { $addToSet: { applicants: req.user._id } },
        { new: true }
    ).populate({
        path: "organizer",
        select: "fullname email role"
    })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })

    // Send confirmation email (async, don't block response)
    sendCompetitionRegistrationEmail(req.user, competition).catch(err =>
        console.error("Failed to send registration email:", err)
    );

    // Emit real-time update for applicant list sync
    getIO().emit("competition_updated", { type: "registration", competitionId });

    return res.status(200).json(new ApiResponse(200, competition, "Successfully registered for competition"))
})

const getRegisteredApplicants = asyncHandler(async (req, res) => {
    const { competitionId } = req.params
    if (!mongoose.isValidObjectId(competitionId)) {
        throw new ApiError(400, "Invalid competition Id")
    }

    const competition = await competitionsSchema.findById(competitionId)
        .populate({
            path: "organizer",
            select: "fullname email role"
        })
        .populate({
            path: "profile",
            select: "profileimage companyLogo companyName"
        })
        .populate("applicants", "fullname email")

    if (!competition) {
        throw new ApiError(404, "Competition not found")
    }

    return res.status(200).json(new ApiResponse(200, competition, "Competition applicants fetched successfully"))
})

export {
    createCompetiton, getCompetitionById, updateCompetition, deleteCompetition,
    getAllCompetitions, RegisterCompetition, getRegisteredApplicants
}