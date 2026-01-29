import mongoose from "mongoose";

const jobClickSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true,
            index: true
        },
        source: {
            type: String,
            required: true,
            enum: ["internal", "adzuna", "jsearch", "remotive"]
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        },
        ip: {
            type: String,
            default: ""
        },
        userAgent: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

// Index for analytics queries
jobClickSchema.index({ jobId: 1, timestamp: -1 });
jobClickSchema.index({ source: 1, timestamp: -1 });

const JobClick = mongoose.model("JobClick", jobClickSchema);
export default JobClick;
