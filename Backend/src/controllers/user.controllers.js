import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import User from '../models/user.schema.js';
import mongoose from 'mongoose';
import { generateOtp } from '../utils/generateOtp.js';
import { sendResetMail } from '../utils/resetMail.js';


const registerUser = asyncHandler(async(req,res)=>{
    const { fullname ,email,password,role}=req.body
   if([fullname,email,password,role].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"All fields are required")
   }
   const existingUser=await User.findOne({email})
   if(existingUser){
    throw new ApiError(400,"User with this email already exists")
   }
   const user= await User.create({
    fullname,
    email,
    password,
    role,
    refreshToken:""
   })
   const createdUser = await User.findById(user._id).select("-password -refreshToken")
   if(!createdUser){
    throw new ApiError(500,"Unable to create user")
   }
   res.status(201).json(new ApiResponse(201,createdUser,"User registered successfully"))


})
const loginUser = asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    if(!email&&!password){
        throw new ApiError(400,"Email and password are required")
    }
    const user=await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User not found or does not exist")
    }
    const isPasswordMatched = await user.isPasswordCorrect(password)
    if (!isPasswordMatched){
        throw new ApiError(401,"Invalid credentials")
        }
    const {accessToken,refreshToken}=await user.generateAccessAndRefreshTokens()
    const loggedInUser =await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    res.status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully",))
})
const getUserProfile = asyncHandler(async(req,res)=>{
   
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(404,{},"User not found")
    }
    res.status(200).json(new ApiResponse(200,user,"User profile fetched successfully"))
})

const logOutUser = asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(req.user._id,{
        $unset:{refreshToken:1}
     },{new:true})
     const options = {
        httpOnly:true, 
        secure:true
    }
     
   
    res.status(200).clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))

})
const forgotPassword = asyncHandler(async(req,res)=>{
    const {email}=req.body;
    if(!email){
        throw new ApiError(400,"Email is required")
    }
    const user=await User.findOne({email}).select("-password -refreshToken")
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const {otp,otpHash,otpExpiry}=generateOtp();
    user.resetotphash=otpHash
    user.resetotpexpiry=otpExpiry
    user.resetotpattempts=0
   await user.save({validateBeforeSave:false})

   const sendMail=await sendResetMail(user.email,otp)
    if(!sendMail){
        throw new ApiError(500,"Unable to send reset OTP email")
    }
    res.status(200).json(new ApiResponse(200,{},"Password reset OTP sent to email successfully"))
})

const resetPassword = asyncHandler(async(req,res)=>{
    const {email,otp,newPassword}=req.body;
    if([email,otp,newPassword].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }
    const user= await User.findOne({email}).select("-password -refreshToken")
    if(!user||!user.resetotphash){
        throw new ApiError(404,"Invalid email or OTP")
    }
    if(user.resetotpattempts>=5){
        throw new ApiError(400,"Password reset OTP attempts exceeded")
    }
    if(!user.resetotpexpiry||!user.resetotpexpiry<Date.now()){
        throw new ApiError(400,"Password reset OTP expired")
    }
    const incomingOtp = await crypto.createHash("sha256").update(otp).digest("hex")
    if(incomingOtp!==user.resetotphash){
        user.resetotpattempts+=1
        await user.save({validateBeforeSave:false})
        throw new ApiError(400,"Invalid OTP")
    }
    user.password=newPassword
    user.resetotphash=undefined
    user.resetotpexpiry=undefined
    user.resetotpattempts=0
    await user.save()
    res.status(200).json(new ApiResponse(200,{},"Password reset successfully"))



})


export {registerUser,loginUser,getUserProfile,logOutUser,forgotPassword,resetPassword}  
