import CronSchedules from "../lib/CronJobsTime.js";

export default {
    jobs: [
        {
            file: "UserJobs",
            name: "cleanInactiveUsers",
            schedule: CronSchedules.every10Minutes,
            enabled: true,
        },
        {
            file: "UserJobs",
            name: "sendBirthdayEmails",
            schedule: CronSchedules.every30Minutes,
            enabled: true,
        },
        {
            file: "ReportJobs",
            name: "generateDailyReport",
            schedule: CronSchedules.dailyMidnight,
            enabled: false,
        },
    ],
};
