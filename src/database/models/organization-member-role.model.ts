import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance';
import { Role } from '../../shared/interfaces';
import { BaseCreationOmittedFields } from '../interfaces';

interface OrganizationMemberRoleAttributes {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrganizationMemberRoleCreationAttributes = Optional<
  OrganizationMemberRoleAttributes,
  BaseCreationOmittedFields
>;

class OrganizationMemberRole
  extends Model<
    OrganizationMemberRoleAttributes,
    OrganizationMemberRoleCreationAttributes
  >
  implements OrganizationMemberRoleAttributes
{
  public id!: string;
  public organizationId!: string;
  public userId!: string;
  public role!: Role;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrganizationMemberRole.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false },
  },
  {
    sequelize,
    tableName: 'organization_member_role',
    modelName: 'OrganizationMemberRole',
    timestamps: true,
  }
);

export default OrganizationMemberRole;
