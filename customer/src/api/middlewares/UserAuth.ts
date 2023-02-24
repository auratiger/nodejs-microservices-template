import { ValidateSignature } from '../../utils/utils.js';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';

export default async (req: Request, res: Response, next: NextFunction) => {
  const isAuthorized = await ValidateSignature(req);

  if (isAuthorized) {
    return next();
  }

  return res.status(HttpStatusCode.Forbidden).json({ message: 'Not Authorized' });
};
