import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter=nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:false,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
})
export const sendResetMail= async (to,otp)=>{
 return await transporter.sendMail({
        from:"Finder <noreply@finder.com>",
        to,
        subject:"Password Reset OTP",
        text:`Your password reset OTP is ${otp}. It is valid for 10 minutes. If you did not request this, please ignore this email.`,
        html:`<p>Your password reset OTP is <b>${otp}</b>.</p><p>With regards,<br/>Finder Team</p>`
    })
}