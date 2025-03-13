const CronSchedules = {
    everySecond: { name: "Every second", schedule: "* * * * * *" }, // (Some cron systems don't support seconds)
    every5Seconds: { name: "Every 5 seconds", schedule: "*/5 * * * * *" },
    every10Seconds: { name: "Every 10 seconds", schedule: "*/10 * * * * *" },
    every30Seconds: { name: "Every 30 seconds", schedule: "*/30 * * * * *" },
    everyMinute: { name: "Every minute", schedule: "*/1 * * * *" },
    every5Minutes: { name: "Every 5 minutes", schedule: "*/5 * * * *" },
    every10Minutes: { name: "Every 10 minutes", schedule: "*/10 * * * *" },
    every30Minutes: { name: "Every 30 minutes", schedule: "*/30 * * * *" },
    everyHour: { name: "Every hour", schedule: "0 * * * *" },
    every3Hours: { name: "Every 3 hours", schedule: "0 */3 * * *" },
    every6Hours: { name: "Every 6 hours", schedule: "0 */6 * * *" },
    every12Hours: { name: "Every 12 hours", schedule: "0 */12 * * *" },
    dailyMidnight: { name: "Every day at midnight", schedule: "0 0 * * *" },
    daily6AM: { name: "Every day at 6 AM", schedule: "0 6 * * *" },
    monday9AM: { name: "Every Monday at 9 AM", schedule: "0 9 * * 1" },
    firstDayOfMonth: { name: "Every 1st of the month", schedule: "0 0 1 * *" },
    sundayMidnight: { name: "Every Sunday at midnight", schedule: "0 0 * * 0" },
    yearlyJan1st: { name: "Every year on January 1st", schedule: "0 0 1 1 *" },
};

export default CronSchedules;
