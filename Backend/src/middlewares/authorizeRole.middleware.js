import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Job from "../models/job.schema.js";

export const authorise =(...roles)=>{
    return (req,res,next) =>{
        if(!req.user||!roles.includes(req.user.role)){
            throw new ApiError(403,"You are not authorized to perform this action")
        
        }
        next()
    }

}