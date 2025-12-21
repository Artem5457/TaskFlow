import { DataTypes, QueryInterface } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  // 1. User table
  await queryInterface.createTable('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    lastName: { type: DataTypes.STRING(255), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });

  // 2. Organization table with FK to user (ownerId)
  await queryInterface.createTable('organization', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' }, // FK
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });

  // 3. Organization_member_role table with FK to user and organization
  await queryInterface.createTable('organization_member_role', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'organization', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    role: { type: DataTypes.STRING(20), allowNull: false },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });

  // 4. Team table with FK to organization
  await queryInterface.createTable('team', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'organization', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });

  // 5. Team_membership table with FK to team and user
  await queryInterface.createTable('team_membership', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'team', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });

  // 6. Task table with FK to team, user (creatorId, assignedToId)
  await queryInterface.createTable('task', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'team', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'open',
    },
    priority: { type: DataTypes.SMALLINT, defaultValue: 3 },
    dueDate: { type: DataTypes.DATE },
    assignedToId: {
      type: DataTypes.UUID,
      references: { model: 'user', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });

  // 7. Comment table with FK to task and user (authorId)
  await queryInterface.createTable('comment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'task', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    body: { type: DataTypes.TEXT, allowNull: false },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });

  // 8. Invitation table with FK to organization
  await queryInterface.createTable('invitation', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'organization', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    email: { type: DataTypes.STRING(255), allowNull: false },
    token: { type: DataTypes.STRING(255), allowNull: false },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: { type: DataTypes.DATE },
  });
};

export const down: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  // Delete tables in reverse order
  await queryInterface.dropTable('invitation');
  await queryInterface.dropTable('comment');
  await queryInterface.dropTable('task');
  await queryInterface.dropTable('team_membership');
  await queryInterface.dropTable('team');
  await queryInterface.dropTable('organization_member_role');
  await queryInterface.dropTable('organization');
  await queryInterface.dropTable('user');
};
