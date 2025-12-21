import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './shared/utils/logger';

const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());

export default app;
