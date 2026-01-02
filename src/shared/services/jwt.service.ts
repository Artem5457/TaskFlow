import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '../interfaces';
import { getConfig } from '../utils/getConfig';

const { hmacSecret } = getConfig();

export class JwtService {
  generateToken(
    userId: string,
    secret: Secret,
    expiresIn: string,
    role: Role = Role.MEMBER
  ): string {
    return jwt.sign({ id: userId, role }, secret, {
      expiresIn,
    } as SignOptions);
  }

  verifyJwt<T extends JwtPayload>(token: string, secret: Secret): T {
    return jwt.verify(token, secret) as T;
  }

  decodeJwt<T extends JwtPayload>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }

  async hashToken(token: string): Promise<string> {
    const key = Buffer.from(hmacSecret, 'base64');

    return crypto.createHmac('sha256', key).update(token).digest('hex');
  }

  async verifyToken(token: string, tokenHash: string): Promise<boolean> {
    const hashedToken = await this.hashToken(token);

    return crypto.timingSafeEqual(
      Buffer.from(hashedToken),
      Buffer.from(tokenHash)
    );
  }
}
