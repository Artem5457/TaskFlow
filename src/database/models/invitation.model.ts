import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance.js';
import { BaseCreationOmittedFields } from '../interfaces';
import { InvitationStatus } from '../../shared/interfaces/index.js';

interface InvitationAttributes {
  id: string;
  organizationId: string;
  email: string;
  token: string;
  status: InvitationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

type InvitationCreationAttributes = Optional<
  InvitationAttributes,
  BaseCreationOmittedFields | 'status'
>;

class Invitation
  extends Model<InvitationAttributes, InvitationCreationAttributes>
  implements InvitationAttributes
{
  public id!: string;
  public organizationId!: string;
  public email!: string;
  public token!: string;
  public status!: InvitationStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Invitation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    token: { type: DataTypes.STRING(255), allowNull: false },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: InvitationStatus.PENDING,
    },
  },
  {
    sequelize,
    tableName: 'invitation',
    modelName: 'Invitation',
    timestamps: true,
  }
);

export default Invitation;
