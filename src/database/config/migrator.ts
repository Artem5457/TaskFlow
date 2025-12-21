import path from 'path';
import { Umzug, SequelizeStorage } from 'umzug';
import { logger } from '../../shared/utils/logger';
import sequelize from './db-instance';

const migrationLogger = logger.child({ scope: 'migration' });
const migrationsGlob: [string, { ignore: string[] }] = [
  path.join(__dirname, '../migrations/*.{ts,js}'),
  {
    ignore: [path.join(__dirname, '../migrations/*.d.ts')],
  },
];

export const migrator = new Umzug({
  migrations: {
    glob: migrationsGlob,
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    info: (msg) => migrationLogger.info(msg),
    warn: (msg) => migrationLogger.warn(msg),
    error: (msg) => migrationLogger.error(msg),
    debug: (msg) => migrationLogger.debug(msg),
  },
});
