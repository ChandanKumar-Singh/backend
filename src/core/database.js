import mongoose from "mongoose";
import Constants from "../config/constants.js";
import { infoLog, logg } from "../utils/logger.js";

logg(Constants.db.mongo.uri)
const connectDB = async () => {
  try {
    await mongoose.connect(Constants.db.mongo.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 50000,
    });
    infoLog("💽 ㏈ MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}; 

export default connectDB;
