import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance';
import { BaseCreationOmittedFields } from '../interfaces';

interface OrganizationAttributes {
  id: string;
  name: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrganizationCreationAttributes = Optional<
  OrganizationAttributes,
  BaseCreationOmittedFields
>;

class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
{
  public id!: string;
  public name!: string;
  public ownerId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    ownerId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    tableName: 'organization',
    modelName: 'Organization',
    timestamps: true,
  }
);

export default Organization;
