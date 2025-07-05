import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { dirname } from "../utils/PathUtils.js";
import { logg, LogUtils } from "../utils/logger.js"

try {
    // const filePath = path.resolve(dirname, "../../rental-room-management-system-firebase-adminsdk-fbsvc-99617f3842.json");
    // const serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const serviceAccountBuffer = Buffer.from(process.env.FIREBASE_SECRET_KEY, "base64");
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString("utf-8"));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    LogUtils.info("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
    LogUtils.error("❌ Firebase Admin SDK initialization failed:", error);
}

