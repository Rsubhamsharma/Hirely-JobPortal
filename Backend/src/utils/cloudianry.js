import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import { UploadStream } from "cloudinary";
import streamifier from "streamifier";
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
    
    
})

export const uploadCloudinary = async (Buffer,options={})=>{
    return new Promise((resolve,reject)=>{
        const uploadStream=cloudinary.uploader.upload_stream(
            {
            resource_type:"auto",
            ...options,
        },
        (error,result)=>{
            if(error){
                return reject(error)
            }
            resolve(result)
        }
    )
    streamifier.createReadStream(Buffer).pipe(uploadStream)
    })
}