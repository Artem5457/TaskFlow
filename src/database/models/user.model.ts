import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance.js';
import { BaseCreationOmittedFields } from '../interfaces';

interface UserAttributes {
  id: string;
  email: string;
  name: string;
  lastName: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  BaseCreationOmittedFields
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public email!: string;
  public name!: string;
  public lastName!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    lastName: { type: DataTypes.STRING(255), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, tableName: 'user', modelName: 'User', timestamps: true }
);

export default User;
