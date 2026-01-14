import { MigrationFn } from 'umzug';
import { QueryInterface, DataTypes } from 'sequelize';
import { TaskPriority } from '@shared/interfaces';

export const up: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  await queryInterface.changeColumn('task', 'priority', {
    type: DataTypes.ENUM(
      TaskPriority.LOW,
      TaskPriority.MIDDLE,
      TaskPriority.HIGH
    ),
    allowNull: false,
    defaultValue: TaskPriority.MIDDLE,
  });
};

export const down: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  // Откат: вернем INTEGER вместо ENUM
  await queryInterface.changeColumn('task', 'priority', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
  });

  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS "enum_task_priority";
  `);
};
