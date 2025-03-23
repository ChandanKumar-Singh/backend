import express from 'express';
import cors from 'cors';
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
const app = express();

app.use(cors({
    origin: "http://localhost:3002",
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
}));
app.use(compression());
app.use(helmet());
app.use(expressvalidator.check());

app.set("view engine", "ejs");
app.use("/public", express.static(Constants.paths.root_public));

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();



app.use('/', routes);
app.get('/', (req, res) => {
    res.send('Welcome to a hybrid Node.js project with both require & import!');
});

app.use(errorHandler);


app.listen(PORT, () => {
    RedisService.start();
    console.log(`Server is running on port ${PORT}`);
    CronManager.laodJobs();
});
