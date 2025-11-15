import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.mongoDB_URL}/${DB_NAME}`);
    console.log(`Database connected to L: ${DB_NAME}`);
  } catch (err) {
    console.log("Error in DB connection", err.message);
    process.exit(1);
  }
};
export default connectDB;
