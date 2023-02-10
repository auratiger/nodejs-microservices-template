export const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  public name: string;
  public statusCode: number;
  public description: string;
  public isOperational: boolean;
  public errorStack?: any;
  public logingErrorResponse?: any;

  constructor(
    name: string,
    statusCode: number,
    description: string,
    isOperational: boolean,
    errorStack?: any,
    logingErrorResponse?: any,
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorStack = errorStack;
    this.logingErrorResponse = logingErrorResponse;
    Error.captureStackTrace(this);
  }
}

//api Specific Errors
export class APIError extends AppError {
  constructor(
    name: string,
    statusCode = STATUS_CODES.INTERNAL_ERROR,
    description = 'Internal Server Error',
    isOperational = true,
  ) {
    super(name, statusCode, description, isOperational);
  }
}

//400
export class BadRequestError extends AppError {
  constructor(description = 'Bad request', logingErrorResponse) {
    super(
      'NOT FOUND',
      STATUS_CODES.BAD_REQUEST,
      description,
      true,
      false,
      logingErrorResponse,
    );
  }
}

//400
export class ValidationError extends AppError {
  constructor(description = 'Validation Error', errorStack) {
    super(
      'BAD REQUEST',
      STATUS_CODES.BAD_REQUEST,
      description,
      true,
      errorStack,
    );
  }
}
