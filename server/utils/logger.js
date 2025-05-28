import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import chalk from 'chalk';
import Constants from '../config/constants.js';

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack || ''}`;
});

// Console log format (with colors)
const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const colorizer = winston.format.colorize().colorize;
    return `${chalk.gray(timestamp)} ${colorizer(level, `[${level.toUpperCase()}]`)}: ${message} ${stack || ''}`;
  })
);

// File log format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.uncolorize(), // Removes ANSI color codes
  logFormat
);

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: consoleFormat, // Colored logs for console
      level: 'info',
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-errors.log',
      datePattern: 'DD-MM-YYYY',
      level: 'error',
      format: fileFormat, // No color in log files
    }),
    // new DailyRotateFile({
    //   filename: 'logs/%DATE%-logs.log',
    //   datePattern: 'DD-MM-YYYY',
    //   level: 'info',
    //   format: fileFormat, // No color in log files
    // }),
  ],
});

// Simple Log Utility (prints when enabled)
const logg = (...args) => {
  if (Constants.log.LOG_ENABLED) console.log(...args);
};

// Chalk-based Print Utils
const print = {
  info: (...args) => console.log(chalk.blue(args[0]), ...args.slice(1)),
  warn: (...args) => console.warn(chalk.yellow(args[0]), ...args.slice(1)),
  error: (...args) => console.error(chalk.red(args[0]), ...args.slice(1)),
  green: (...args) => console.log(chalk.green(args[0]), ...args.slice(1)),
  yellow: (...args) => console.log(chalk.yellow(args[0]), ...args.slice(1)),
  red: (...args) => console.log(chalk.red(args[0]), ...args.slice(1)),
  fade: (...args) => console.log(chalk.grey(args[0]), ...args.slice(1)),
};
const infoLog = (...d) => print.info(...d);
const warnLog = (...d) => print.warn(...d);
const errorLog = (...d) => print.error(...d);
const greenLog = (...d) => print.green(...d);
const yellowLog = (...d) => print.yellow(...d);
const redLog = (...d) => print.red(...d);
const fadeLog = (...d) => print.fade(...d);

// Exported Utility Functions
const LogUtils = {
  info: (...args) => Constants.log.LOG_ENABLED && console.log(...args),
  warn: (...args) => Constants.log.WARNING_ENABLED && console.warn(...args),
  error: (...args) => Constants.log.ERROR_ENABLED && console.error(...args),
};

export {
  logger,
  logg,
  LogUtils,
  infoLog,
  warnLog,
  errorLog,
  greenLog,
  yellowLog,
  redLog,
  fadeLog,

};
