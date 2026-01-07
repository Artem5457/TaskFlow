import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';
import { getConfig } from '../getConfig';
import { logger } from '../logger';
import { AuthPayload } from '../../../auth/auth.interfaces';

type AuthRequest = Request & { user?: AuthPayload };

const { accessTokenSecret } = getConfig();

/**
 * Middleware for verifying a JWT access token
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(
      {
        path: req.path,
        method: req.method,
      },
      'JWT authentication failed: missing or malformed Authorization header'
    );
    throw new UnauthorizedError('Access token missing');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, accessTokenSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    logger.warn('JWT authentication failed: invalid or expired token');

    throw new UnauthorizedError('Invalid or expired token');
  }
};
