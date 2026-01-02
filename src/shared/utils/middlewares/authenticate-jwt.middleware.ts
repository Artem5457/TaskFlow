import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';
import { getConfig } from '../getConfig';
import { logger } from '../logger';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

const { accessTokenSecret } = getConfig();

/**
 * Middleware for verifying a JWT access token
 */
export const authenticateJwt = (
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
    const payload = jwt.verify(token, accessTokenSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    logger.warn('JWT authentication failed: invalid or expired token');

    throw new UnauthorizedError('Invalid or expired token');
  }
};
