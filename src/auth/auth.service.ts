import bcrypt from 'bcrypt';
import { getConfig } from '../shared/utils/getConfig';
import { AuthPayload, RegisterReqBody } from './auth.interfaces';
import { RefreshToken, User } from '../database/models';
import {
  UnauthorizedError,
  UserAlreadyExistsError,
} from '../shared/utils/errors';
import {
  calcExpirationDate,
  calcMillisecondsInDays,
} from '../shared/utils/helpers';
import sequelize from '../database/config/db-instance';
import { JwtService } from '../shared/services/jwt.service';
import { logger } from '../shared/utils/logger';
import { UniqueConstraintError } from 'sequelize';

const jwtService = new JwtService();
const {
  dummyPasswordHash,
  accessTokenSecret,
  accessTokenExpiresIn,
  refreshTokenSecret,
  refreshTokenExpiresIn,
  refreshTokenDaysValid,
} = getConfig();

const SALT_ROUNDS = 12;

export class AuthService {
  async registerUser(data: RegisterReqBody): Promise<User> {
    const hash = await this.hashPassword(data.password);

    try {
      const user = await User.create({
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: hash,
      });

      logger.info(
        { userId: user.id, email: user.email },
        'User successfully created'
      );

      return user;
    } catch (error) {
      if (error instanceof UniqueConstraintError && error.fields?.email) {
        logger.warn(
          { email: data.email },
          'Attempt to register already existing email'
        );
        throw new UserAlreadyExistsError(data.email);
      }

      logger.error({ error }, 'Error creating user');
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await User.findOne({ where: { email } });
    const passwordHash = user?.password || dummyPasswordHash;

    const isValid = await this.verifyPassword(password, passwordHash);
    if (!user || !isValid) {
      logger.warn({ email }, 'Invalid login attempt');
      throw new UnauthorizedError();
    }

    logger.info(
      { userId: user.id, email: user.email },
      'User successfully validated'
    );

    return user;
  }

  generateTokenPair(userId: string, email: string) {
    const accessToken = jwtService.generateToken(
      userId,
      accessTokenSecret,
      accessTokenExpiresIn,
      email
    );
    const refreshToken = jwtService.generateToken(
      userId,
      refreshTokenSecret,
      refreshTokenExpiresIn,
      email
    );

    logger.info({ userId }, 'Token pair generated (access + refresh)');

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const refreshTokenHash = jwtService.hashToken(refreshToken);
    const expiresAt = calcExpirationDate(
      calcMillisecondsInDays(refreshTokenDaysValid)
    );

    await sequelize.transaction(async (t) => {
      await RefreshToken.destroy({ where: { userId }, transaction: t });
      await RefreshToken.create(
        { userId, token: refreshTokenHash, expiresAt },
        { transaction: t }
      );
    });

    logger.info({ userId }, 'Refresh token stored');
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = jwtService.hashToken(refreshToken);
    await RefreshToken.destroy({ where: { token: tokenHash } });
  }

  async validateRefreshToken(refreshToken: string): Promise<AuthPayload> {
    let payload: AuthPayload;
    try {
      payload = jwtService.verifyJwt<AuthPayload>(
        refreshToken,
        refreshTokenSecret
      );
    } catch {
      logger.warn('Invalid refresh token provided');
      throw new UnauthorizedError();
    }

    const storedToken = await RefreshToken.findOne({
      where: { userId: payload.id },
    });
    if (!storedToken) {
      logger.warn({ userId: payload.id }, 'Refresh token not found in DB');
      throw new UnauthorizedError();
    }

    const valid = jwtService.verifyToken(refreshToken, storedToken.token);
    if (!valid) {
      logger.warn({ userId: payload.id }, 'Refresh token mismatch');
      throw new UnauthorizedError();
    }

    logger.info({ userId: payload.id }, 'Refresh token validated successfully');

    return payload;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
