import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../shared/utils/middlewares';
import { loginSchema, registerSchema } from './auth.schemas';

const router = Router();

const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

export const authRoutes = router;
