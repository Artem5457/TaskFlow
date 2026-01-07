import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { getConfig } from '../shared/utils/getConfig';
import { calcMillisecondsInDays } from '../shared/utils/helpers';
import {
  LoginReqBody,
  LoginResBody,
  RegisterReqBody,
  RegisterResBody,
} from './auth.interfaces';
import { UnauthorizedError } from '../shared/utils/errors';
import { logger } from '../shared/utils/logger';

const authService = new AuthService();

const { nodeEnv, refreshTokenDaysValid } = getConfig();

export class AuthController {
  async register(
    req: Request<unknown, unknown, RegisterReqBody>,
    res: Response<RegisterResBody>
  ): Promise<void> {
    const user = await authService.registerUser(req.body);

    logger.info(
      `User registered: ${JSON.stringify({ userId: user.id, email: user.email })}`
    );

    res.status(201).json({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
    });
  }

  async login(
    req: Request<unknown, unknown, LoginReqBody>,
    res: Response<LoginResBody>
  ): Promise<void> {
    const { email, password } = req.body;

    logger.info({ email }, 'Login attempt');

    const user = await authService.validateUser(email, password);
    const { accessToken, refreshToken } = authService.generateTokenPair(
      user.id,
      email
    );

    await authService.storeRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: calcMillisecondsInDays(refreshTokenDaysValid),
    });

    logger.info({ userId: user.id, email: user.email }, 'User logged in');

    res.json({ accessToken });
  }

  async refreshToken(req: Request, res: Response<LoginResBody>): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      logger.warn('Refresh token missing in request');
      throw new UnauthorizedError('Refresh token is required');
    }

    const { id, email } = await authService.validateRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      authService.generateTokenPair(id, email);

    await authService.storeRefreshToken(id, newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: calcMillisecondsInDays(refreshTokenDaysValid),
    });

    logger.info({ userId: id }, 'Token refreshed');

    res.json({ accessToken });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
      logger.info('User logged out successfully');
    } else {
      logger.warn('Logout attempt without refresh token');
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax',
    });

    res.sendStatus(204);
  }
}
