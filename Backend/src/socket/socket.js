import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.CORS_ORIGIN, "http://localhost:3000"],
            credentials: true
        }
    });

    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                socket.handshake.headers?.cookie?.split('accessToken=')[1]?.split(';')[0];

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select("-password");

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.fullname} (${socket.id})`);

        // Join personal room for notifications
        socket.join(socket.user._id.toString());

        // Join conversation room
        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.user._id} joined conversation ${conversationId}`);
        });

        // Handle typing indicators
        socket.on("typing", ({ conversationId, isTyping }) => {
            socket.to(conversationId).emit("user_typing", {
                userId: socket.user._id,
                isTyping
            });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const notifyUser = (userId, event, data) => {
    if (io) {
        io.to(userId.toString()).emit(event, data);
    }
};

export const emitToConversation = (conversationId, event, data) => {
    if (io) {
        io.to(conversationId.toString()).emit(event, data);
    }
};
