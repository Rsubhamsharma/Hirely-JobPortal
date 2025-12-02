import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadCloudinary} from "../utils/cloudianry.js";
import Profile from "../models/profile.schema.js";  
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.schema.js";
import mongoose from "mongoose";

const createProfile = asyncHandler(async (req,res)=>{
    
})
