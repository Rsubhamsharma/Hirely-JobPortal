import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Configure CORS to accept multiple origins
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.CORS_ORIGIN
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route Declarations
import userRoutes from "./routes/user.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import jobRoutes from "./routes/job.routes.js"
import competitionRoutes from "./routes/competition.routes.js"
import applicationRoutes from "./routes/application.routes.js"
import messageRoutes from "./routes/message.routes.js"


app.use("/api/v1/users", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/jobs", jobRoutes)
app.use("/api/v1/competitions", competitionRoutes)
app.use("/api/v1/applications", applicationRoutes)
app.use("/api/v1/messages", messageRoutes)

import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);



export default app;
