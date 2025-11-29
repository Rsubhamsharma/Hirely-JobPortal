import crypto from "crypto";

export const generateOtp=()=>{
    const otp=crypto.randomInt(100000,1000000).toString();
    const otpHash=crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpiry=Date.now()+10*60*1000;
    return {otp,otpHash,otpExpiry}
}
