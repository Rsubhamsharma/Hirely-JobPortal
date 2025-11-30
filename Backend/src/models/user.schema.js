import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["applicant", "recruiter","admin"],
    },
    refreshToken: {
      type: String,
    },
    profile:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"profile"
    },
    //password reset token and expiry 
    resetotphash:{
      type:String
    },
    resetotpexpiry:{
      type:Date
    },
    resetotpattempts:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

userSchema.methods.generateAccessAndRefreshTokens = async function () {
  try {
    const accessToken = jwt.sign(
      { _id: this._id,
        email:this.email

      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { _id: this._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    this.refreshToken = refreshToken;
    await this.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};
userSchema.pre("save", async function (next){
  if(!this.isModified("password")){
    return next()
  }
  this.password=await bcrypt.hash(this.password,10)
  next()
})
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password)
}

const User = mongoose.model("user", userSchema);
export default User;
