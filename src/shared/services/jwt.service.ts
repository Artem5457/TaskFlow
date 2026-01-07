import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { getConfig } from '../utils/getConfig';

const { hmacSecret } = getConfig();

export class JwtService {
  generateToken(
    userId: string,
    secret: Secret,
    expiresIn: string,
    email: string
  ): string {
    return jwt.sign({ id: userId, email }, secret, {
      expiresIn,
    } as SignOptions);
  }

  verifyJwt<T extends JwtPayload>(token: string, secret: Secret): T {
    return jwt.verify(token, secret) as T;
  }

  decodeJwt<T extends JwtPayload>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }

  hashToken(token: string) {
    const key = Buffer.from(hmacSecret, 'base64');

    return crypto.createHmac('sha256', key).update(token).digest('hex');
  }

  verifyToken(token: string, tokenHash: string): boolean {
    const hashedToken = this.hashToken(token);

    return crypto.timingSafeEqual(
      Buffer.from(hashedToken, 'hex'),
      Buffer.from(tokenHash, 'hex')
    );
  }
}
