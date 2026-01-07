import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance';
import { Role } from '../../shared/interfaces';
import { BaseCreationOmittedFields } from '../interfaces';

interface OrganizationMemberAttributes {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrganizationMemberCreationAttributes = Optional<
  OrganizationMemberAttributes,
  BaseCreationOmittedFields
>;

class OrganizationMember
  extends Model<
    OrganizationMemberAttributes,
    OrganizationMemberCreationAttributes
  >
  implements OrganizationMemberAttributes
{
  public id!: string;
  public organizationId!: string;
  public userId!: string;
  public role!: Role;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrganizationMember.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    role: {
      type: DataTypes.ENUM(Role.OWNER, Role.ADMIN, Role.MEMBER),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'organization_member_role',
    modelName: 'OrganizationMember',
    timestamps: true,
  }
);

export default OrganizationMember;
