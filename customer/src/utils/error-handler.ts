import logger, { ErrorLogger } from './logger.js';
import { Request, Response, NextFunction } from 'express';

const ErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction): Promise<any> => {
  const errorLogger = new ErrorLogger();

  process.on('uncaughtException', (reason, promise: Promise<any>) => {
    logger.info(`${reason}, 'UNHANDLED'`);
    throw reason; // need to take care
  });

  process.on('uncaughtException', (error) => {
    errorLogger.logError(error);
    if (errorLogger.isTrustError(err)) {
      //process exist // need restart
    }
  });

  // logger.info(err.description, '-------> DESCRIPTION')
  // logger.info(err.message, '-------> MESSAGE')
  // logger.info(err.name, '-------> NAME')
  if (err) {
    await errorLogger.logError(err);
    if (errorLogger.isTrustError(err)) {
      if (err.errorStack) {
        const errorDescription = err.errorStack;
        return res.status(err.statusCode).json({ message: errorDescription });
      }
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      //process exit // terriablly wrong with flow need restart
    }
    return res.status(err.statusCode).json({ message: err.message });
  }
  next();
};

export default ErrorHandler;
