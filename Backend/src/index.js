import app from "./app.js";
import connectDB from "./DB/connectDB.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Error starting server or connecting to the database", err);
    process.exit(1);
  });
