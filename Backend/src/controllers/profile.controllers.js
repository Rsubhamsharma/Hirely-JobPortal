import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadCloudinary} from "../utils/cloudianry.js";
import Profile from "../models/profile.schema.js";  
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.schema.js";
import mongoose from "mongoose";

const createOrUpdateProfile = asyncHandler(async (req,res)=>{
    const {phoneNumber,resume,skills,experience,education,portfolio,github,linkedin} = req.body
    const updates={}
    const isValidPhone = p => /^\+?[0-9]{7,15}$/.test(String(p));
    const normalizeUrl= u => {
        if(!u) return false
        let urlString = u;
        if(!urlString.startsWith('http://') && !urlString.startsWith('https://')){
            urlString = 'https://' + urlString;
        }
        try {
            new URL(urlString);
            return urlString;
        } catch {
            return null;
        
        }
    }
   if(phoneNumber!== undefined && phoneNumber!="" ){
    if(!isValidPhone(phoneNumber)){
        throw new ApiError(400,"Invalid phone number")
    }
    updates.phoneNumber=phoneNumber
}
 const urlField = {portfolio,github,linkedin}
 for(const [field,value] of Object.entries(urlField)){
    if(value!= undefined && value!=""){
        const url = normalizeUrl(value)
        if(!url){
            throw new ApiError(400,`Invalid ${field} URL`)
        }
        updates[field]=url

    }
 }
 if(experience!=undefined ){
    if(!Array.isArray(experience)){
        throw new ApiError(400,"Experience must be an array")
    }
    updates.experience=experience

 }
 if(education!=undefined ){
    if(!Array.isArray(education)){
        throw new ApiError(400,"Education must be an array")
    }
    updates.education=education

 }
 if(skills!=undefined ){
    if(!Array.isArray(skills)){
        throw new ApiError(400,"Skills must be an array")
    }
    updates.skills=skills

 }
if (req.file) {
    const uploadResume = await uploadCloudinary(req.user.buffer,{
        folder:"Finder"
    });
    if (!uploadResume?.secure_url) throw new ApiError(500, "Resume upload failed");
    updates.resume = uploadResume.secure_url;
  } else if (resume !== undefined && resume !== "") {
    const n = normalizeUrl(resume);
    if (!n) throw new ApiError(400, "Invalid resume URL");
    updates.resume = n;
  }
updates.user=req.user._id

const profile = await Profile.findOneAndUpdate({user:req.user._id},
        {$set:updates},{
            new:true,
            upsert:true,
            runValidators:true,
            context:"query"
        }).populate("user","fullname email role")




res.status(200).json(new ApiResponse(200,profile,"Profile created or updated successfully"))

})
export {createOrUpdateProfile}