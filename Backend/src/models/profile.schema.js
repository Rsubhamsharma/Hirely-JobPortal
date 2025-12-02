import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one profile per user
    },
    profilesummary:{
      type:String,
      default:""
    },
    profileimage:{
      type:String,
      default:""
    },
    phoneNumber: {
      type: String,
      default:""
    },
    // firstName and lastName are removed to avoid redundancy with User model's fullname
    resume: {
      type: String, // URL to the resume from a cloud service
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: [
        {
          company: { type: String, required: true },
          position: { type: String, required: true },
          startDate: { type: Date, required: true },
          endDate: { type: Date }, // Not required, for current jobs
          description: { type: String },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          institution: { type: String, required: true },
          degree: { type: String, required: true },
          fieldOfStudy: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
        },
      ],
      default: [],
    },
    portfolio:{
      type:String,
      default:""
    },
    github:{
      type:String,
      default:""
    },
    linkedin:{
      type:String,
      default:""
    }
    
    
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
