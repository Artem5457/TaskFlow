import { MigrationFn } from 'umzug';
import { QueryInterface, DataTypes } from 'sequelize';

export const up: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  await queryInterface.createTable('refresh_token', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
};

export const down: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  await queryInterface.dropTable('refresh_token');
};
