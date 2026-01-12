import app from "./app.js";
import connectDB from "./DB/connectDB.js";
import { createServer } from "http";
import { initSocket } from "./socket/socket.js";
import { validateEnv } from "./utils/validateEnv.js";
import { initScheduler } from "./services/scheduler.js";
import dotenv from "dotenv";

dotenv.config();
validateEnv();

connectDB()
  .then(() => {
    initScheduler();
    const port = process.env.PORT || 8000;
    const httpServer = createServer(app);

    initSocket(httpServer);

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Error starting server or connecting to the database", err);
    process.exit(1);
  });
