import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadCloudinary = async (filebuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                ...options,

            },
            (error, result) => {
                if (error) {
                    // console.error("Cloudinary upload error:", error.message || error);
                    return reject(error);
                }
                // console.log("Cloudinary upload success:", result?.secure_url);
                resolve(result);
            }
        );

        try {
            streamifier.createReadStream(filebuffer).pipe(uploadStream);
        } catch (err) {
            // console.error("Stream error:", err.message || err);
            reject(err);
        }
    });
}