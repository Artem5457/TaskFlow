import express from 'express';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import { logger } from '@shared/utils/logger';
import { authRoutes } from '@auth/auth.route';
import { teamRoutes } from '@team/team.route';
import { organizationRoutes } from '@organization/organization.route';
import { errorHandler } from '@shared/utils/middlewares';

const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/organizations/:orgId/teams', teamRoutes);

// Middleware errorHandler is connected last
app.use(errorHandler);

export default app;
