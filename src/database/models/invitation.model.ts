import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance.js';
import { BaseCreationOmittedFields } from '../interfaces';
import { InvitationStatus, Role } from '../../shared/interfaces';

interface InvitationAttributes {
  id: string;
  organizationId: string;
  email: string;
  token: string;
  status: InvitationStatus;
  invitedMemberRole: Role;
  expiresAt: Date;
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
  public invitedMemberRole!: Role;
  public expiresAt!: Date;
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
      type: DataTypes.ENUM(
        InvitationStatus.PENDING,
        InvitationStatus.ACCEPTED,
        InvitationStatus.EXPIRED
      ),
      allowNull: false,
      defaultValue: InvitationStatus.PENDING,
    },
    invitedMemberRole: {
      type: DataTypes.ENUM(Role.MEMBER, Role.ADMIN),
      allowNull: false,
      defaultValue: Role.MEMBER,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
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
