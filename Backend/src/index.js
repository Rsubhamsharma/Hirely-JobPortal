import app from "./app.js";
import connectDB from "./DB/connectDB.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("Error starting server or connecting to the database", err);
    process.exit(1);
  });
