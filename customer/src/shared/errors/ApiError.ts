import { HttpStatusCode } from '../enums/HttpStatusCode.js';
import BaseError from './BaseError.js';

export default class ApiError extends BaseError {
  constructor(message: string, methodName = '', httpCode = HttpStatusCode.INTERNAL_SERVER, isOperational = true) {
    super('', message, methodName, httpCode, isOperational);
  }
}
