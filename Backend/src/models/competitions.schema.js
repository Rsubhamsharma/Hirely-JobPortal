import mongoose from "mongoose";

const competitionsSchema = mongoose.Schema(
    {
        title :{
            type:String,
            required:true
        },
        organizer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
          
        },
        date:{
            type:String,
             required:true
        },
        prize:{
            type:String
        
        },
        status:{
            type:String,
            required:true
        }
    }
)
export default mongoose.model("competition",competitionsSchema)