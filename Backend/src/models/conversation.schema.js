import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }],
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "application"
    },
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "competition"
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message"
    }
}, { timestamps: true });

// Prevent duplicate conversations for the same application
conversationSchema.index({ application: 1 }, { unique: true, sparse: true });

export default mongoose.model("conversation", conversationSchema);
