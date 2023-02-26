import { HttpStatusCode } from 'axios';
import BaseError from './BaseError.js';

export default class ApiError extends BaseError {
  constructor(message: string, methodName = '', httpCode = HttpStatusCode.InternalServerError, isOperational = true) {
    super('', message, methodName, httpCode, isOperational);
  }
}
