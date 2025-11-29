import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";

    export const verifyjwt = asyncHandler(async (req,_, next) => {
    const accessToken = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer ","")
    try {
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized access");
    }
    const verifyToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(verifyToken?.userId).select("=password -refreshToken")
    if (!user) {
        throw new ApiError(400,"Unauthorized access - user not found")
    }
    req.user = user
    next();
} catch (error) {
    throw new ApiError(500,error)
}
})
