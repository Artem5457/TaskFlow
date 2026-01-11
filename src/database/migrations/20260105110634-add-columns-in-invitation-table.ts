import { MigrationFn } from 'umzug';
import { QueryInterface, DataTypes } from 'sequelize';
import { Role } from '@shared/interfaces';

export const up: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  await queryInterface.addColumn('invitation', 'expiresAt', {
    type: DataTypes.DATE,
    allowNull: false,
  });

  await queryInterface.addColumn('invitation', 'invitedMemberRole', {
    type: DataTypes.ENUM(Role.MEMBER, Role.ADMIN),
    allowNull: false,
    defaultValue: Role.MEMBER,
  });
};

export const down: MigrationFn = async ({ context }) => {
  const queryInterface = context as QueryInterface;

  await queryInterface.removeColumn('invitation', 'expiresAt');
  await queryInterface.removeColumn('invitation', 'invitedMemberRole');
};
