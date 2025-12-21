import { IConfig } from '../interfaces/index';
import { envVars } from './constants';

const getConfigValueOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`No ${key} variable provided`);
  }
  return value;
};

export const getConfig = (): IConfig => ({
  dbName: getConfigValueOrThrow(envVars.DB_NAME),
  dbUsername: getConfigValueOrThrow(envVars.DB_USERNAME),
  dbPassword: getConfigValueOrThrow(envVars.DB_PASSWORD),
  dbHost: getConfigValueOrThrow(envVars.DB_HOST),
  port: Number(getConfigValueOrThrow(envVars.PORT)),
});
