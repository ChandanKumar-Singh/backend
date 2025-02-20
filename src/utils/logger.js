import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Constants from '../config/constants.js';

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${message} ${stack || ''}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                logFormat
            ),
            level: 'info', 
        }),
        // new DailyRotateFile({
        //     filename: 'logs/%DATE%-combined.log',
        //     datePattern: 'YYYY-MM-DD',
        //     level: 'info',
        // }),
        new DailyRotateFile({
            filename: 'logs/%DATE%-errors.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
        }),
    ],
});
 
// Add console logging in development
if (!Constants.envs.production) {
    // logger.add(new winston.transports.Console({
    //     format: winston.format.combine(
    //         winston.format.colorize(),
    //         winston.format.simple()
    //     ),
    // }));
}

const logg = (...d) => {
    console.warn(...d)
}

export { logg , logger}