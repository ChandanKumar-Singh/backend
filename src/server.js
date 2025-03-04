import express from 'express';
import cors from 'cors';
import connectDB from './core/database.js';
import compression from "compression";
import bodyParser from "body-parser";
import expressvalidator from "express-validator";
//  logger
import morgan from "morgan";
import helmet from "helmet";
import { assignQueryAndParamsToBody } from './middlewares/index.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import Constants from './config/constants.js';
import { logg } from './utils/logger.js';
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(morgan('dev')); // combined
app.use(compression());
app.use(helmet());
app.use(assignQueryAndParamsToBody);
app.use(expressvalidator.check());
// Set the view engine to EJS
app.set("view engine", "ejs");
app.use("/public", express.static(Constants.path.root_public));

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

app.use('/', routes);
app.get('/', (req, res) => {
    res.send('Welcome to a hybrid Node.js project with both require & import!');
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
