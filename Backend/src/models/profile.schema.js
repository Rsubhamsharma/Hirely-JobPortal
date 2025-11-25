import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  resume: {
    type: String, // URL to the resume
  },
  skills: {
    type: [String],
  },
  experience:{
    type: String,
  },
  education:{
    type:String,
  }
  
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
