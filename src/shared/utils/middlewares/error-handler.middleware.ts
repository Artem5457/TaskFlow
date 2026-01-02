import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger';
import { AppError } from '../errors/app-error';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
  });
};
