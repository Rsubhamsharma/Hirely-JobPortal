import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadCloudinary} from "../utils/cloudianry.js";
import Profile from "../models/profile.schema.js";  
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.schema.js";
import mongoose from "mongoose";

const createOrUpdateProfile = asyncHandler(async (req,res)=>{
    const {profileimage,phoneNumber,resume,profilesummary,skills,experience,education,portfolio,github,linkedin} = req.body
    const updates={}
    const isValidPhone = p => {
    const cleaned = String(p).replace(/\s+/g, "");
    return /^\+?[0-9]{7,15}$/.test(cleaned);
};
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
    updates.phoneNumber = String(phoneNumber).replace(/\s+/g, "").trim();
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
 if(profilesummary!=undefined && profilesummary!=""){
    updates.profilesummary=profilesummary

 }

if(req.files?.profileimage?.[0]){
    try {
        const uploadProfileImage = await uploadCloudinary(req.files.profileimage[0].buffer, {
            folder:"Finder/images",
            resource_type:"auto"
        })
        if(!uploadProfileImage?.secure_url){
            throw new ApiError(500, "Profile image upload failed")
        }
        updates.profileimage = uploadProfileImage.secure_url;
    } catch (err) {
        // console.error("Profile image upload error:", err.message || err);
        throw new ApiError(500, err.message || "Profile image upload failed");
    }
}  
else if(profileimage!== undefined && profileimage !== ""){
    const n = normalizeUrl(profileimage)
    if(!n) throw new ApiError(400,"Invalid profile image URL")
    updates.profileimage=n
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
if (req.files?.resume?.[0]) {
    try {
        const uploadResume = await uploadCloudinary(req.files.resume[0].buffer, {
            folder:"Finder/files",
            resource_type:"auto"
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
else if (resume!== undefined && resume !== "") {
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

const getProfile = asyncHandler(async(req,res)=>{
    const profile = await Profile.findOne({user:req.user._id}).populate("user","fullname email role")
    if(!profile){
        throw new ApiError(404,"Profile not found")
    }
    res.status(200).json(new ApiResponse(200,profile,"Profile fetched successfully"))

})
const changeExperience = asyncHandler(async (req,res)=>{
    const{experienceId} = req.params
    const {company,position,startDate,endDate,description}=req.body
    const updates={}
    if(company!=undefined&&company!=""){
        updates["experience.$.company"]=company
     }
     if(position!=undefined&&position!=""){
        updates["experience.$.position"]=position
     }
    if(startDate!=undefined&&startDate!=""){
        updates["experience.$.startDate"]=startDate
     }
     if(endDate!=undefined&&endDate!=""){
        updates["experience.$.endDate"]=endDate
     }
     if(description!=undefined&&description!=""){
        updates["experience.$.description"]=description
     
    }
    const experience = await Profile.findOneAndUpdate({user:req.user._id,"experience._id":experienceId},
        {$set:updates},
        {
            new:true,
            runValidators:true,
            context:"query"
        }
    ).populate("user","fullname email role")
    
    if(!experience){
        throw new ApiError(404,"Experience not found")
    }
   
    res.status(200).json(new ApiResponse(200,experience,"Experience updated successfully"))

})
const addSkills = asyncHandler(async(req,res)=>{
    const {skills}=req.body
    let skillsArray = Array.isArray(skills)?skills:[skills]
    skillsArray = skillsArray.filter(s => String(s).trim())
    if(skillsArray.length===0){
        throw new ApiError(400,"Skills array cannot be empty")
    }

    const profile = await Profile.findOneAndUpdate({user:req.user._id},
        {$addToSet:{skills:{$each:skillsArray}}},
        {
            new:true,
            runValidators:true,
            context:"query"
        }
    ).populate("user","fullname")
    
res.status(200).json(new ApiResponse(200,profile,"Skills added successfully"))
})
const addEducation = asyncHandler(async(req,res)=>{
    const{institution,degree,fieldOfStudy,startDate,endDate}=req.body
    const updates={}
    if(institution!=undefined&&institution!=""){
        updates.institution=institution
     }
     if(degree!=undefined&&degree!=""){
        updates.degree=degree
    }
    if(fieldOfStudy!=undefined&&fieldOfStudy!=""){
        updates.fieldOfStudy=fieldOfStudy
    }
    if(startDate!=undefined&&startDate!=""){
        updates.startDate=startDate
    }
    if(endDate!=undefined&&endDate!=""){
        updates.endDate=endDate
    }
   const education = await Profile.findOneAndUpdate({user:req.user._id},
    {$addToSet:{education:updates}},
    {   
        new:true,
        runValidators:true,
        context:"query"
    }
   ).populate("user","fullname")
   if(!education){
    throw new ApiError(404,"Education cannot be added")
   }
   res.status(200).json(new ApiResponse(200,education,"Education added successfully"))  

})
export {createOrUpdateProfile,getProfile,changeExperience,addSkills,addEducation}