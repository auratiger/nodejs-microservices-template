import { HttpStatusCode } from 'axios';

export default class BaseError extends Error {
  public readonly log: string;
  public readonly methodName: string;
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(
    log: string,
    message: string | unknown = log,
    methodName = '',
    httpCode = HttpStatusCode.InternalServerError,
    isOperational = true,
  ) {
    super(<string>message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.log = log;
    this.methodName = methodName;
    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}
