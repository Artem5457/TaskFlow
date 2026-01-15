import { MigrationFn } from 'umzug';
import { QueryInterface, DataTypes } from 'sequelize';
import { TaskPriority } from '@shared/interfaces';

export const up: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  // Drop existing default to avoid casting issues
  await queryInterface.sequelize.query(`
    ALTER TABLE "task"
    ALTER COLUMN "priority" DROP DEFAULT;
  `);

  // Create ENUM type if it doesn't exist
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_task_priority'
      ) THEN
        CREATE TYPE "enum_task_priority" AS ENUM (
          '${TaskPriority.LOW}',
          '${TaskPriority.MIDDLE}',
          '${TaskPriority.HIGH}'
        );
      END IF;
    END$$;
  `);

  // Change column type using explicit cast
  await queryInterface.sequelize.query(`
    ALTER TABLE "task"
    ALTER COLUMN "priority"
    TYPE "enum_task_priority"
    USING (
      CASE "priority"
        WHEN 1 THEN '${TaskPriority.LOW}'::enum_task_priority
        WHEN 2 THEN '${TaskPriority.MIDDLE}'::enum_task_priority
        WHEN 3 THEN '${TaskPriority.HIGH}'::enum_task_priority
        ELSE '${TaskPriority.MIDDLE}'::enum_task_priority
      END
    );
  `);

  // Set new default and not-null constraint
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

  // Drop ENUM default to avoid casting issues
  await queryInterface.sequelize.query(`
    ALTER TABLE "task"
    ALTER COLUMN "priority" DROP DEFAULT;
  `);

  // Change ENUM back to INTEGER using explicit mapping
  await queryInterface.sequelize.query(`
    ALTER TABLE "task"
    ALTER COLUMN "priority"
    TYPE INTEGER
    USING (
      CASE "priority"
        WHEN '${TaskPriority.LOW}' THEN 1
        WHEN '${TaskPriority.MIDDLE}' THEN 2
        WHEN '${TaskPriority.HIGH}' THEN 3
        ELSE 2
      END
    );
  `);

  // Set integer default and not-null constraint
  await queryInterface.changeColumn('task', 'priority', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
  });

  // Drop ENUM type
  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS "enum_task_priority";
  `);
};
