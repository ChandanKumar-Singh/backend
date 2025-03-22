import mongoose from "mongoose";
import Constants from "../config/constants.js";
import { infoLog, errorLog, logg } from "../utils/logger.js";

const connectDB = async () => {
  try {
    // Note: useNewUrlParser and useUnifiedTopology are no longer needed in newer Mongoose versions
    // They're automatically set to true
    await mongoose.connect(Constants.db.mongo.uri, {
      serverSelectionTimeoutMS: 50000,
    });
    
    infoLog("💽 ㏈ MongoDB connected");
    
    // Add connection event handlers
    mongoose.connection.on("error", (err) => {
      errorLog(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on("disconnected", () => {
      infoLog("MongoDB disconnected. Attempting to reconnect...");
    });
    
    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      infoLog("MongoDB connection closed due to app termination");
      process.exit(0);
    });
    
  } catch (err) {
    errorLog(`MongoDB connection error: ${err}`);
    // Retry connection after delay instead of exiting immediately
    infoLog("Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
