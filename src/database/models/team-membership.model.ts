import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance.js';
import { BaseCreationOmittedFields } from '../interfaces';

interface TeamMembershipAttributes {
  id: string;
  teamId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type TeamMembershipCreationAttributes = Optional<
  TeamMembershipAttributes,
  BaseCreationOmittedFields
>;

class TeamMembership
  extends Model<TeamMembershipAttributes, TeamMembershipCreationAttributes>
  implements TeamMembershipAttributes
{
  public id!: string;
  public teamId!: string;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamMembership.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    teamId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    tableName: 'team_membership',
    modelName: 'TeamMembership',
    timestamps: true,
  }
);

export default TeamMembership;
