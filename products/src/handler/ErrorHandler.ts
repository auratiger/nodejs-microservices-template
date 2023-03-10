import { Express, Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { ValidationError } from 'express-validation';
import { Service } from 'typedi';
import logger from '../utils/logger.js';
import ApiError from './errors/ApiError.js';
import BaseError from './errors/BaseError.js';

export const tryCatch =
  (callback: (req: Request, res: Response) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await callback(req, res);
    } catch (err) {
      return next(err);
    }
  };

@Service()
export default class ErrorHandler {
  public init(app: Express): void {
    app.use(this.handler); // Register middleware

    process.on('uncaughtException', async (error: Error) => {
      logger.error(error);
      if (!this.isTrustedError(error)) process.exit(1);
    });

    process.on('unhandledRejection', (reason: Error) => {
      throw reason;
    });
  }

  private handler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (!this.isTrustedError(err)) {
      next(err);
      return;
    }

    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err);
    }

    if (err instanceof ApiError) {
      return res.status(err.httpCode).json({
        errorCode: err.name,
      });
    }

    logger.error(err);
    return res.status(HttpStatusCode.InternalServerError).send('Something went wrong');
  };

  private isTrustedError(error: Error) {
    return error instanceof BaseError && error.isOperational;
  }
}
