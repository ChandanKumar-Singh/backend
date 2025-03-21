import CronSchedules from "../lib/CronJobsTime.js";

export default {
    jobs: [
        {
            file: "UserJobs",
            name: "cleanInactiveUsers",
            schedule: CronSchedules.every10Minutes,
            enabled: false,
        },
        {
            file: "UserJobs",
            name: "sendBirthdayEmails",
            schedule: CronSchedules.every30Minutes,
            enabled: false,
        },
        {
            file: "ReportJobs",
            name: "generateDailyReport",
            schedule: CronSchedules.dailyMidnight,
            enabled: false,
        },
    ],
};
