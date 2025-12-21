import 'dotenv/config';
import { getConfig } from './shared/utils/getConfig';
import sequelize from './database/config/db-instance';
import { logger } from './shared/utils/logger';
import { migrator } from './database/config/migrator';
import app from './app';

const { port } = getConfig();

async function bootstrap() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    await migrator.up();

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error(
      `Failed to start the application. Reason: Reason: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

bootstrap();
