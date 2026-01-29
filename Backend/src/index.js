import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./DB/connectDB.js";
import { createServer } from "http";
import { initSocket } from "./socket/socket.js";
import { validateEnv } from "./utils/validateEnv.js";
import { initScheduler } from "./services/scheduler.js";
import { initRedis } from "./services/redis.service.js";
validateEnv();

connectDB()
  .then(() => {
    initScheduler();

    // Initialize Redis (optional - will connect lazily when first used)
    try {
      initRedis();
    } catch (error) {
    }
    const port = process.env.PORT || 8000;
    const httpServer = createServer(app);

    initSocket(httpServer);

    httpServer.listen(port, () => {
    });
  })
  .catch((err) => {
    console.error("Error starting server or connecting to the database", err);
    process.exit(1);
  });
