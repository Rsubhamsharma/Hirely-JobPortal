import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Conversation from "../models/conversation.schema.js";
import Message from "../models/message.schema.js";
import { emitToConversation } from "../socket/socket.js";

import Application from "../models/application.schema.js";

/**
 * Get or create a conversation for an application
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    let conversation = await Conversation.findOne({ application: applicationId })
        .populate("participants", "fullname email role");

    if (!conversation) {
        // Find application to get the applicant and job (which has the recruiter)
        const application = await Application.findById(applicationId).populate("job");
        if (!application) {
            throw new ApiError(404, "Application not found");
        }

        // Participants: Applicant and Recruiter
        const participants = [application.applicant, application.job.postedBy];

        conversation = await Conversation.create({
            application: applicationId,
            participants,
        });

        await conversation.populate("participants", "fullname email role");
    }

    return res.status(200).json(
        new ApiResponse(200, conversation, "Conversation retrieved successfully")
    );
});

/**
 * Send a message
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    const message = await Message.create({
        conversationId,
        senderId,
        content
    });

    await message.populate("senderId", "fullname email");

    // Update conversation with last message and increment unread count for other participants
    const conversation = await Conversation.findById(conversationId);
    conversation.lastMessage = message._id;

    // Increment unread count for all participants except the sender
    conversation.participants.forEach(participantId => {
        if (participantId.toString() !== senderId.toString()) {
            const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
            conversation.unreadCount.set(participantId.toString(), currentCount + 1);
        }
    });

    await conversation.save();

    // Emit real-time update
    emitToConversation(conversationId, "new_message", message);

    return res.status(201).json(
        new ApiResponse(201, message, "Message sent successfully")
    );
});

/**
 * Get message history
 */
export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
        .populate("senderId", "fullname email")
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, messages, "Messages fetched successfully")
    );
});

/**
 * Get all conversations for the current user
 */
export const getMyConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: userId
    })
        .populate("participants", "fullname email role")
        .populate("application", "job")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, conversations, "Conversations fetched successfully")
    );
});

/**
 * Get unread message count for the current user
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all conversations user is part of
    const conversations = await Conversation.find({
        participants: userId
    });

    const conversationIds = conversations.map(c => c._id);

    // Count unread messages (messages in user's conversations that weren't sent by them and haven't been read)
    const unreadCount = await Message.countDocuments({
        conversationId: { $in: conversationIds },
        senderId: { $ne: userId },
        readAt: null
    });

    return res.status(200).json(
        new ApiResponse(200, { unreadCount }, "Unread count fetched successfully")
    );
});

/**
 * Mark all messages in a conversation as read
 */
export const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Mark all unread messages in this conversation as read
    await Message.updateMany(
        {
            conversationId,
            senderId: { $ne: userId },
            readAt: null
        },
        {
            $set: { readAt: new Date() }
        }
    );

    // Reset unread count for this user in the conversation
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
        conversation.unreadCount.set(userId.toString(), 0);
        await conversation.save();

        // Emit event to user's personal room to update navbar badge
        const { notifyUser } = await import("../socket/socket.js");
        notifyUser(userId, "messages_read", { conversationId });
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Messages marked as read")
    );
});
