import fs from 'fs';
import * as _ from 'lodash';
import { createLogger, transports, format, Logger, config } from 'winston';
import { AppError } from './app-errors';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// -- NOTE: adds custom logging levels
const levels = _.clone(config.syslog.levels);
const colors = _.clone(config.syslog.colors);

levels.request = _.max(levels) + 1;
colors.request = 'blue';
// --

// TODO: maybe convert this into a class and inject it with typedi
const logger: Logger = createLogger({
  exitOnError: false,
  level: process.env.LOG_LEVEL || 'info',
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'combined.log',
    }),
    new transports.File({
      dirname: logDir,
      filename: 'app-error.log',
      level: 'error',
      maxsize: 5242880, //5MB
      maxFiles: 5,
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      dirname: logDir,
      filename: 'app-info.log',
      level: 'info',
      maxsize: 5242880, //5MB
      maxFiles: 5,
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss',
    }),
    format.splat(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
});

// TODO: check out what the deal is with this logger
const LogErrors = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app_error.log' }),
  ],
});

export class ErrorLogger {
  async logError(err) {
    logger.info('==================== Start Error Logger ===============');
    LogErrors.log({
      private: true,
      level: 'error',
      message: `${new Date()}-${JSON.stringify(err)}`,
    });
    logger.info('==================== End Error Logger ===============');
    // log error with Logger plugins

    return false;
  }

  isTrustError(error: AppError) {
    if (error instanceof AppError) {
      return error?.isOperational;
    } else {
      return false;
    }
  }
}

export default logger;
