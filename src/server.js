import express from 'express';
import cors from 'cors';
import connectDB from './core/database.js';
import compression from "compression";
import bodyParser from "body-parser";
import expressvalidator from "express-validator";
import morgan from "morgan";
import helmet from "helmet";
import { assignQueryAndParamsToBody } from './middlewares/index.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import Constants from './config/constants.js';
import Redis from './services/RedisService.js';
import RedisService from './services/RedisService.js';
import FileDownloadUtils from './utils/FileDownloadUtils.js';
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(morgan('dev'));
app.use(compression());
app.use(helmet());
app.use(expressvalidator.check());

app.set("view engine", "ejs");
app.use("/public", express.static(Constants.path.root_public));


const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// app.use(assignQueryAndParamsToBody);
app.use('/', routes);
app.get('/', (req, res) => {
    res.send('Welcome to a hybrid Node.js project with both require & import!');
});
FileDownloadUtils.downloadFile('https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', 'downloaded').then((v) => {
    console.log("File download response:", v);
}
);

app.use(errorHandler);

app.listen(PORT, () => {
    RedisService.start();
    console.log(`Server is running on port ${PORT}`);
});
