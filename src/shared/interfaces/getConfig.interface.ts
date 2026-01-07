import { Secret } from 'jsonwebtoken';

export interface IConfig {
  nodeEnv: string;
  dbName: string;
  dbUsername: string;
  dbPassword: string;
  dbHost: string;
  port: number;
  accessTokenSecret: Secret;
  refreshTokenSecret: Secret;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  refreshTokenDaysValid: number;
  dummyPasswordHash: string;
  hmacSecret: string;
  invitationTokenDaysValid: number;
}
