import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudianry.js";
import Profile from "../models/profile.schema.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.schema.js";
import mongoose from "mongoose";

const createOrUpdateProfile = asyncHandler(async (req, res) => {
    const { phoneNumber, profilesummary, skills, experience, education, portfolio, github, linkedin, profileimage, resume, companyName, companyLogo, aboutCompany } = req.body
    const updates = {}
    const isValidPhone = p => {
        const cleaned = String(p).replace(/\s+/g, "");
        return /^\+?[0-9]{7,15}$/.test(cleaned);
    };
    const normalizeUrl = u => {
        if (!u) return false
        let urlString = u;
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
            urlString = 'https://' + urlString;
        }
        try {
            new URL(urlString);
            return urlString;
        } catch {
            return null;

        }
    }
    if (phoneNumber !== undefined) {
        if (phoneNumber === "") {
            updates.phoneNumber = ""; // Allow clearing
        } else if (!isValidPhone(phoneNumber)) {
            throw new ApiError(400, "Invalid phone number");
        } else {
            updates.phoneNumber = String(phoneNumber).replace(/\s+/g, "").trim();
        }
    }
    const urlField = { portfolio, github, linkedin }
    for (const [field, value] of Object.entries(urlField)) {
        if (value !== undefined) {
            if (value === "") {
                updates[field] = ""; // Allow clearing
            } else {
                const url = normalizeUrl(value);
                if (!url) {
                    throw new ApiError(400, `Invalid ${field} URL`);
                }
                updates[field] = url;
            }
        }
    }
    if (profilesummary !== undefined) {
        updates.profilesummary = profilesummary; // Allow empty string
    }

    if (req.files?.profileimage?.[0]) {
        try {
            const uploadProfileImage = await uploadCloudinary(req.files.profileimage[0].buffer, {
                folder: "Finder/images",
                resource_type: "auto"
            })
            if (!uploadProfileImage?.secure_url) {
                throw new ApiError(500, "Profile image upload failed")
            }
            updates.profileimage = uploadProfileImage.secure_url;
        } catch (err) {
            // console.error("Profile image upload error:", err.message || err);
            throw new ApiError(500, err.message || "Profile image upload failed");
        }
    }
    else if (profileimage !== undefined && profileimage !== "") {
        const n = normalizeUrl(profileimage)
        if (!n) throw new ApiError(400, "Invalid profile image URL")
        updates.profileimage = n
    }

    // Company fields for recruiters
    if (companyName !== undefined && companyName !== "") {
        updates.companyName = companyName.trim();
    }

    if (aboutCompany !== undefined && aboutCompany !== "") {
        updates.aboutCompany = aboutCompany.trim();
    }

    // Handle company logo upload
    if (req.files?.companyLogo?.[0]) {
        try {
            const uploadCompanyLogo = await uploadCloudinary(req.files.companyLogo[0].buffer, {
                folder: "Finder/images",
                resource_type: "auto"
            });
            if (!uploadCompanyLogo?.secure_url) {
                throw new ApiError(500, "Company logo upload failed");
            }
            updates.companyLogo = uploadCompanyLogo.secure_url;
        } catch (err) {
            throw new ApiError(500, err.message || "Company logo upload failed");
        }
    }
    else if (companyLogo !== undefined && companyLogo !== "") {
        const n = normalizeUrl(companyLogo);
        if (!n) throw new ApiError(400, "Invalid company logo URL");
        updates.companyLogo = n;
    }


    if (experience != undefined) {
        if (!Array.isArray(experience)) {
            throw new ApiError(400, "Experience must be an array")
        }
        updates.experience = experience

    }
    if (education != undefined) {
        if (!Array.isArray(education)) {
            throw new ApiError(400, "Education must be an array")
        }
        updates.education = education

    }
    if (skills != undefined) {
        if (!Array.isArray(skills)) {
            throw new ApiError(400, "Skills must be an array")
        }
        updates.skills = skills

    }
    if (req.files?.resume?.[0]) {
        try {
            const uploadResume = await uploadCloudinary(req.files.resume[0].buffer, {
                folder: "Finder/files",
                resource_type: "auto"
            });
            if (!uploadResume?.secure_url) {
                throw new ApiError(500, "Resume upload failed");
            }
            updates.resume = uploadResume.secure_url;
        } catch (err) {
            // console.log("Resume upload error:", err.message || err);
            throw new ApiError(500, err.message || "Resume upload failed");
        }
    }
    else if (resume !== undefined && resume !== "") {
        const n = normalizeUrl(resume);
        if (!n) throw new ApiError(400, "Invalid resume URL");
        updates.resume = n;
    }
    updates.user = req.user._id

    const profile = await Profile.findOneAndUpdate({ user: req.user._id },
        { $set: updates }, {
        new: true,
        upsert: true,
        runValidators: true,
        context: "query"
    }).populate("user", "fullname email role")

    // Link profile to user if not already linked
    if (profile) {
        await User.findByIdAndUpdate(req.user._id, { profile: profile._id });
    }

    res.status(200).json(new ApiResponse(200, profile, "Profile created or updated successfully"))

})

const getProfile = asyncHandler(async (req, res) => {
    let profile = await Profile.findOne({ user: req.user._id }).populate("user", "fullname email role")

    // If no profile exists, create an empty one for the user
    if (!profile) {
        profile = await Profile.create({ user: req.user._id });
        profile = await Profile.findOne({ user: req.user._id }).populate("user", "fullname email role");
    }

    res.status(200).json(new ApiResponse(200, profile, "Profile fetched successfully"))

})
const changeExperience = asyncHandler(async (req, res) => {
    const { experienceId } = req.params
    const { company, position, startDate, endDate, description } = req.body
    const updates = {}
    if (company != undefined && company != "") {
        updates["experience.$.company"] = company
    }
    if (position != undefined && position != "") {
        updates["experience.$.position"] = position
    }
    if (startDate != undefined && startDate != "") {
        updates["experience.$.startDate"] = startDate
    }
    if (endDate != undefined && endDate != "") {
        updates["experience.$.endDate"] = endDate
    }
    if (description != undefined && description != "") {
        updates["experience.$.description"] = description

    }
    const experience = await Profile.findOneAndUpdate({ user: req.user._id, "experience._id": experienceId },
        { $set: updates },
        {
            new: true,
            runValidators: true,
            context: "query"
        }
    ).populate("user", "fullname email role")

    if (!experience) {
        throw new ApiError(404, "Experience not found")
    }

    res.status(200).json(new ApiResponse(200, experience, "Experience updated successfully"))

})
const addSkills = asyncHandler(async (req, res) => {
    const { skills } = req.body
    let skillsArray = Array.isArray(skills) ? skills : [skills]
    skillsArray = skillsArray.filter(s => String(s).trim())
    if (skillsArray.length === 0) {
        throw new ApiError(400, "Skills array cannot be empty")
    }

    const profile = await Profile.findOneAndUpdate({ user: req.user._id },
        { $addToSet: { skills: { $each: skillsArray } } },
        {
            new: true,
            runValidators: true,
            context: "query"
        }
    ).populate("user", "fullname email")

    res.status(200).json(new ApiResponse(200, profile, "Skills added successfully"))
})
const addEducation = asyncHandler(async (req, res) => {
    const { institution, degree, fieldOfStudy, startDate, endDate } = req.body
    const updates = {}
    if (institution != undefined && institution != "") {
        updates.institution = institution
    }
    if (degree != undefined && degree != "") {
        updates.degree = degree
    }
    if (fieldOfStudy != undefined && fieldOfStudy != "") {
        updates.fieldOfStudy = fieldOfStudy
    }
    if (startDate != undefined && startDate != "") {
        updates.startDate = startDate
    }
    if (endDate != undefined && endDate != "") {
        updates.endDate = endDate
    }
    const education = await Profile.findOneAndUpdate({ user: req.user._id },
        { $addToSet: { education: updates } },
        {
            new: true,
            runValidators: true,
            context: "query"
        }
    ).populate("user", "fullname email")
    if (!education) {
        throw new ApiError(404, "Education cannot be added")
    }
    res.status(200).json(new ApiResponse(200, education, "Education added successfully"))

})

const removeExperience = asyncHandler(async (req, res) => {
    const { experienceId } = req.params
    if (!experienceId) throw new ApiError(400, "Experience ID is required")
    if (!mongoose.Types.ObjectId.isValid(experienceId)) {
        throw new ApiError(400, "Invalid Experience ID format")
    }
    const experience = await Profile.findOneAndUpdate({ user: req.user._id },
        { $pull: { experience: { _id: experienceId } } },
        {
            new: true,
            runValidators: true,
            context: "query"
        }
    ).populate("user", "fullname email")
    if (!experience) {
        throw new ApiError(404, "Experience not found")
    }
    res.status(200).json(new ApiResponse(200, experience, "Experience removed successfully"))

})

const removeEducation = asyncHandler(async (req, res) => {
    const { educationId } = req.params
    if (!educationId) throw new ApiError(400, "Education ID is required")
    if (!mongoose.Types.ObjectId.isValid(educationId)) {
        throw new ApiError(400, "Invalid Education ID format")
    }
    const education = await Profile.findOneAndUpdate({ user: req.user._id },
        { $pull: { education: { _id: educationId } } },
        {
            new: true,
            runValidators: true,
            context: "query"
        }
    ).populate("user", "fullname email")
    if (!education) throw new ApiError(404, "Education not found")
    res.status(200).json(new ApiResponse(200, education, "Education removed successfully"))
})
const removeSkill = asyncHandler(async (req, res) => {
    let skillToRemove = req.params.skill || req.params.skills || req.query.skill || req.query.skills || req.body.skill || req.body.skills;
    // helpful debug when request isn't providing body (DELETE bodies can be skipped by some clients)
    if (!skillToRemove && Object.keys(req.body || {}).length === 0) {
        console.log("removeSkill: no body provided; check Content-Type and that client sends body for DELETE");
    }
    if (!skillToRemove) throw new ApiError(400, "Skill to remove is required (send as param, query or body)");
    if (!Array.isArray(skillToRemove)) skillToRemove = [skillToRemove];
    skillToRemove = skillToRemove.map(s => String(s).trim()).filter(Boolean);
    if (skillToRemove.length === 0) throw new ApiError(400, "No valid skills provided");
    const profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $pullAll: { skills: skillToRemove } },
        {
            new: true,
            runValidators: true,
            context: "query"
        }).populate("user", "fullname email")

    if (!profile) throw new ApiError(404, "Profile not found")
    res.status(200).json(new ApiResponse(200, profile, "Skills removed successfully"))

})

const changeEducation = asyncHandler(async (req, res) => {
    const { educationId } = req.params;
    const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(educationId)) {
        throw new ApiError(400, "Invalid Education ID format");
    }

    const updates = {};
    if (institution !== undefined) updates["education.$.institution"] = institution;
    if (degree !== undefined) updates["education.$.degree"] = degree;
    if (fieldOfStudy !== undefined) updates["education.$.fieldOfStudy"] = fieldOfStudy;
    if (startDate !== undefined) updates["education.$.startDate"] = startDate;
    if (endDate !== undefined) updates["education.$.endDate"] = endDate;

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No update fields provided");
    }

    const profile = await Profile.findOneAndUpdate(
        { user: req.user._id, "education._id": educationId },
        { $set: updates },
        {
            new: true,
            runValidators: true,
            context: "query"
        }
    ).populate("user", "fullname email role");

    if (!profile) {
        throw new ApiError(404, "Education entry not found in this profile");
    }

    res.status(200).json(new ApiResponse(200, profile, "Education updated successfully"));
});

const getProfileById = asyncHandler(async (req, res) => {
    const { userId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID format");
    }

    const profile = await Profile.findOne({ user: userId }).populate("user", "fullname email role");

    if (!profile) {
        throw new ApiError(404, "Profile not found for the given user ID");
    }

    res.status(200).json(new ApiResponse(200, profile, "Profile fetched successfully"));
})
const uploadResume = asyncHandler(async (req, res) => {
    // Accept file upload (req.file) OR an external resume URL (req.body.resume)
    const bodyResume = req.body?.resume;
    const file = req.file; // multer.single('resume') -> req.file

    if (!file && !bodyResume) {
        throw new ApiError(400, "Resume is required (file upload or resume URL)");
    }

    const normalizeUrl = (u) => {
        if (!u) return null;
        let urlString = String(u).trim();
        if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
            urlString = "https://" + urlString;
        }
        try {
            new URL(urlString); // will throw if invalid
            return urlString;
        } catch (err) {
            return null;
        }
    };

    // If file uploaded -> validate & upload to cloud
    let resumeUrl = null;

    if (file) {
        // Validate MIME and size (example: allow pdf, doc, docx; size <= 5 MB)
        const allowedMimes = [
            "application/pdf",
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        ];
        const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

        if (!allowedMimes.includes(file.mimetype)) {
            throw new ApiError(400, "Invalid file type. Allowed: pdf, doc, docx");
        }
        if (file.size && file.size > maxSizeBytes) {
            throw new ApiError(400, "File too large. Max 5 MB");
        }

        try {
            const uploadResult = await uploadCloudinary(file.buffer, {
                folder: "Finder/files",
                resource_type: "auto",
            });

            if (!uploadResult?.secure_url) {
                console.error("Cloudinary result:", uploadResult);
                throw new ApiError(500, "Resume upload failed (cloudinary)");
            }

            resumeUrl = normalizeUrl(uploadResult.secure_url);
            if (!resumeUrl) throw new ApiError(400, "Invalid resume URL after upload");
        } catch (err) {
            console.error("Resume upload error:", err);
            // if err is ApiError let it bubble up, else wrap to avoid leaking internals
            if (err instanceof ApiError) throw err;
            throw new ApiError(500, "Resume upload failed");
        }
    } else {
        // No file; use provided URL
        resumeUrl = normalizeUrl(bodyResume);
        if (!resumeUrl) throw new ApiError(400, "Invalid resume URL");
    }

    // Update profile with the resume URL
    try {
        const profile = await Profile.findOneAndUpdate(
            { user: req.user._id },
            { $set: { resume: resumeUrl } },
            { new: true, runValidators: true, context: "query" }
        ).populate("user", "fullname email role");

        if (!profile) throw new ApiError(404, "Profile not found");

        return res
            .status(200)
            .json(new ApiResponse(200, profile, "Resume uploaded successfully"));
    } catch (err) {
        console.error("Profile update error:", err);
        // Optional: if you uploaded to cloudinary and DB update failed, you might remove the uploaded file here.
        if (err instanceof ApiError) throw err;
        throw new ApiError(500, "Failed to update profile with resume");
    }
});

// Delete profile photo
const deleteProfilePhoto = asyncHandler(async (req, res) => {
    const profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $unset: { profileimage: "" } },
        { new: true, runValidators: true }
    ).populate("user", "fullname email role");

    if (!profile) {
        throw new ApiError(404, "Profile not found");
    }

    res.status(200).json(new ApiResponse(200, profile, "Profile photo deleted successfully"));
});

// Update user fullname
const updateUserName = asyncHandler(async (req, res) => {
    const { fullname } = req.body;

    if (!fullname || fullname.trim() === "") {
        throw new ApiError(400, "Fullname is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullname: fullname.trim() } },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, user, "Name updated successfully"));
});


export {
    createOrUpdateProfile, getProfile, changeExperience,
    addSkills, addEducation, removeExperience, removeEducation,
    removeSkill,
    changeEducation,
    getProfileById,
    uploadResume,
    deleteProfilePhoto,
    updateUserName

}