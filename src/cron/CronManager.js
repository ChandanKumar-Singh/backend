import cron from "node-cron";
import CronConfig from "../config/CronConfig.js";
import { errorLog, greenLog, infoLog, logg, warnLog } from "../utils/logger.js";
import chalk from "chalk";

class CronManager {

    laodJobs = async () => {
        for (const job of CronConfig.jobs) {
            if (!job.enabled) {
                warnLog(`⏳ Job [${job.name}] is disabled. Skipping.`);
                continue;
            }
            try {
                const jobModule = await import(`./jobs/${job.file}.js`);

                if (!jobModule[job.name]) {
                    throw new Error(`Job function [${job.name}] not found in ${job.file}.js`);
                }

                cron.schedule(job.schedule.schedule, async () => {
                    greenLog(`🚀 Running Job: `, job.name);
                    const start = Date.now();

                    try {
                        await jobModule[job.name](); // Run job
                        infoLog(`✅ Completed Job: `, chalk.yellow(job.name), `in ${Date.now() - start}ms`);
                    } catch (error) { 
                        errorLog(`❌ Job Failed: `, chalk.red(job.name), error);
                    }
                });

                infoLog(`🟢 Scheduled Job: ${job.name} from ${job.file}.js (${job.schedule.name})`);
            } catch (error) {
                errorLog(`❌ Error loading job: ${job.name} from ${job.file}.js`, error);
            }
        }
    };
}

export default new CronManager();
