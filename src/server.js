import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import connectDB from './core/database.js';
import compression from "compression";
import bodyParser from "body-parser";
import expressvalidator from "express-validator";
import morgan from "morgan";
import helmet from "helmet";
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import Constants from './config/constants.js';
import RedisService from './services/RedisService.js';
import CronManager from './cron/CronManager.js';
import './core/firebase.js';
import { logger } from './utils/logger.js';
import { dirname } from './utils/PathUtils.js';
const app = express();

app.use(cors({
    origin: ["http://localhost:3002", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(morgan('dev', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(compression());
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
    })
);

app.use(expressvalidator.check());

/// data providing
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/public", express.static(Constants.paths.root_public));

/// Flutter app path
/* const appPath = '../../../../tests/artisian/test/build/web';
const flutterWebPath = path.join(__dirname, appPath);
app.use('/app', express.static(flutterWebPath));
*/

// app.get("/", (req, res) => {
//     res.render("index", {
//         appName: process.env.APP_NAME || 'MyApp',
//         appVersion: process.env.APP_VERSION || '1.0.0',
//         appDescription: process.env.APP_DESCRIPTION || 'Backend API Server',
//         appAuthor: process.env.APP_AUTHOR || 'Unknown Author',
//         apiVersion: process.env.API_V || '/api/v1/',
//         port: process.env.PORT || 3000,
//         showFlutterAppLink: true
//     });
// })

app.get('/preview/admin', (req, res) => {
    res.render('preview/admin/dashboard');
});


// Connect to database
connectDB();



app.use(Constants.routes.api, routes);
app.use(Constants.routes.view, routes);
app.use(errorHandler);

const PORT = Constants.paths.port || 3000;
app.listen(PORT, () => {
    RedisService.start();
    console.log(`Server is running on port ${PORT} and url: ${Constants.paths.url}`);
    CronManager.laodJobs();
});
