import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", process.env.CORS_ORIGIN],
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


app.use("/api/v1/users", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/jobs", jobRoutes)

import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);



export default app;
