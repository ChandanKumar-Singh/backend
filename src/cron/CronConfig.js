import CronSchedules from "../lib/CronJobsTime.js";
import UserJobs from "./jobs/UserJobs.js";
import ReportJobs from "./jobs/ReportJobs.js";

export default {
    jobs: [
        {
            name: "CeanActiveUsers",
            callBack: UserJobs.cleanInactiveUsers,
            schedule: CronSchedules.every10Seconds,
            enabled: true,
        },
        {
            name: "SendBirthdayEmails",
            callBack: UserJobs.sendBirthdayEmails,
            schedule: CronSchedules.every30Minutes,
            enabled: false,
        },
        {
            name: "GenerateWeeklyReport",
            callBack: ReportJobs.generateWeeklyReport,
            schedule: CronSchedules.dailyMidnight,
            enabled: false,
        },
    ],
};
