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
  console.log(...d)
}

import chalk from 'chalk';


const print = {
  info: (...d) => console.log(chalk.blue(`${d[0]}`), ...d.slice(1)),
  warn: (...d) => console.warn(chalk.yellow(`${d[0]}`), ...d.slice(1)),
  error: (...d) => console.error(chalk.red(`${d[0]}`), ...d.slice(1)),
  green: (...d) => console.log(chalk.green(d[0]), ...d.slice(1)),
  yellow: (...d) => console.log(chalk.yellow(d[0]), ...d.slice(1)),
  red: (...d) => console.log(chalk.red(d[0]), ...d.slice(1)),
  fade: (...d) => console.log(chalk.grey(d[0]), ...d.slice(1)),
};
const infoLog = (...d) => print.info(...d);
const warnLog = (...d) => print.warn(...d);
const errorLog = (...d) => print.error(...d);
const greenLog = (...d) => print.green(...d);
const yellowLog = (...d) => print.yellow(...d);
const redLog = (...d) => print.red(...d);
const fadeLog = (...d) => print.fade(...d);

const LogUtils = (function () {
  return {
    log: function () {
      if (Constants.log.LOG_ENABLED) {
        const args = Array.prototype.slice.call(arguments);
        console.log.apply(console, args);
      }
    },
    warn: function () {
      if (Constants.log.WARNING_ENABLED) {
        const args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, args);
      }
    },
    error: function () {
      if (Constants.log.ERROR_ENABLED) {
        const args = Array.prototype.slice.call(arguments);
        console.error.apply(console, args);
      }
    },
  };
}());


export { logg, logger, infoLog, warnLog, errorLog, greenLog, yellowLog, redLog, fadeLog, LogUtils };
