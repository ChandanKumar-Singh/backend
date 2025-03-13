import { fadeLog } from "../../utils/logger.js";

// ✅ Job 1: Clean inactive users
export const cleanInactiveUsers = async () => {
    fadeLog("⏳ Cleaning inactive users...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work
    fadeLog("✅ Inactive users cleaned up!");
};

// ✅ Job 2: Send birthday emails
export const sendBirthdayEmails = async () => {
    fadeLog("🎂 Sending birthday emails...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
    fadeLog("📧 Birthday emails sent successfully!");
};
