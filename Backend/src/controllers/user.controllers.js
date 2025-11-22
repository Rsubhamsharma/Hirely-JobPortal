import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import User from '../models/user.schema.js';


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
    const isPasswordMatched = await isPasswordCorrect(password)
    if (!isPasswordMatched){
        throw new ApiError(401,"Invalid credentials")
        }
    const {accessToken,refreshToken}=await user.generateAccessAndRefreshTokens()
    const loggedInUser =await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly:true,
        secure:true
    }
    res.status(200).cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully",))
})
const getUserProfile = asyncHandler(async(req,res)=>{
    const userId=req.user._id
    const user = await User.findById(userId).select("-password -refreshToken")
    if(!user){
        throw new ApiError(404,{},"User not found")
    }
    res.status(200).json(new ApiResponse(200,user,"User profile fetched successfully"))
})
export {registerUser,loginUser,getUserProfile}  
