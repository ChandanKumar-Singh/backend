import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import connectDB from './core/database.js';
import compression from "compression";
import bodyParser from "body-parser";
import expressvalidator from "express-validator";
import morgan from "morgan";
import helmet from "helmet";
import router from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import Constants from './config/constants.js';
import { Redis } from './services/RedisService.js';
import CronManager from './cron/CronManager.js';
import './core/firebase.js';
import { logger } from './utils/logger.js';
import { dirname } from './utils/PathUtils.js';
import { HttpStatusCode } from 'axios';
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5001",
    "http://localhost:5173",
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(morgan('dev', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(compression());

/// helmet
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-eval'",            // <-- Needed for Flutter WASM eval
                    "https://www.gstatic.com"
                ],
                connectSrc: [
                    "'self'",
                    "https://www.gstatic.com",
                    "https://fonts.gstatic.com" // <-- Needed for font loading
                ],
                imgSrc: ["'self'", "data:", "https://www.gstatic.com"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                fontSrc: [
                    "'self'",
                    "https://fonts.gstatic.com" // <-- Allow Google Fonts
                ],
                mediaSrc: ["'none'"],
                objectSrc: ["'none'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(expressvalidator.check());

/// data providing
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use("/public", express.static(Constants.paths.root_public, {
    /*  setHeaders: (res, path, stat) => {
         const origin = res.req.headers.origin;
         if (allowedOrigins.includes(origin)) {
             res.setHeader('Access-Control-Allow-Origin', origin);
             res.setHeader('Access-Control-Allow-Credentials', 'true');
         }
     } */
}));

// Connect to database
connectDB();

app.use('/', router);


app.use((req, res) => {
    res.status(HttpStatusCode.NotFound).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>404 - Not Found</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; }
    h1 { font-size: 3rem; color: #d33; }
  </style>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>The page you're looking for doesn't exist.</p>
</body>
</html>
    `);
});

app.use(errorHandler);

const PORT = Constants.paths.port || 3000;
server.listen(PORT, () => {
    Redis.start(server);
    console.log(`Server is running on port ${PORT} and url: ${Constants.paths.url}`);
    CronManager.laodJobs();
});
