import express from 'express';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import { logger } from './shared/utils/logger';
import { errorHandler } from './shared/utils/middlewares';
import { authRoutes } from './auth/auth.route';

const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

// Middleware errorHandler is connected last
app.use(errorHandler);

export default app;
