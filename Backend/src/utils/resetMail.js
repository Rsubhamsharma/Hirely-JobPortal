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
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f6f9fc; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 8px; }
    .otp { font-size: 28px; font-weight: bold; color: #2d89ef; letter-spacing: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email</h2>
    <p>Hello,</p>
    <p>Please use the One-Time Password (OTP) below to complete verification:</p>
    <div class="otp">{{OTP_CODE}}</div>
    <p>This code will expire in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p>If you didn’t request this, you can safely ignore this email.</p>
  </div>
</body>
</html>
`;

export const sendResetMail= async (to,otp)=>{
 return await transporter.sendMail({
        from:"Finder <noreply@finder.com>",
        to,
        subject:"Password Reset OTP",
        text:`Your password reset OTP is ${otp}. It is valid for 10 minutes. If you did not request this, please ignore this email.`,
        html:emailTemplate.replace("{{OTP_CODE}}", otp)
    })
}