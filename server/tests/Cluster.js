import cluster from "cluster";
import http from "http";
import os from "os";

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`Master process ${process.pid} is running`);
    console.log(`Forking ${numCPUs} workers...\n`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }


    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    // Worker processes
    http
        .createServer((req, res) => {
            res.writeHead(200);
            res.end(`Hello from Worker ${process.pid}\n`);
        })
        .listen(3000);

    console.log(`Worker ${process.pid} started`);
}

import { Queue } from "bullmq";

const emailQueue = new Queue("emailQueue", { connection: { host: "127.0.0.1", port: 6379 } });

const sendEmail = async (email) => {
  await emailQueue.add("sendEmail", { email });
};
import { Worker } from "bullmq";

const worker = new Worker("emailQueue", async (job) => {
  console.log("Sending email to:", job.data.email);
});




import rateLimit from "express-rate-limit";
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit failed login attempts
  message: "Too many failed login attempts. Try again later.",
});

router.use("/api/auth/login", authLimiter);
