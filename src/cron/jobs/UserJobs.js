import { fadeLog } from "../../utils/logger.js";
import UserDBO from "../../dbos/UserDBO.js";


class UserJobs {
    cleanInactiveUsers = async () => {
        fadeLog("⏳ Cleaning inactive users...");
        const list = await UserDBO.getList();
        fadeLog("✅ Inactive users cleaned up!", { list });
    };

    sendBirthdayEmails = async () => {
        fadeLog("🎂 Sending birthday emails...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
        fadeLog("📧 Birthday emails sent successfully!");
    };
}

export default new UserJobs();