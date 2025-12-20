import { Sequelize } from 'sequelize';
import { getConfig } from '../../shared/utils/getConfig.js';

const { dbName, dbUsername, dbPassword, dbHost } = getConfig();

const sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
  host: dbHost,
  dialect: 'postgres',
  logging: true,
});

export default sequelize;
