import { Model, DataTypes, Optional } from 'sequelize';
import { BaseCreationOmittedFields } from '../interfaces';
import sequelize from '../config/db-instance.js';

interface CommentAttributes {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommentCreationAttributes = Optional<
  CommentAttributes,
  BaseCreationOmittedFields
>;

class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public id!: string;
  public taskId!: string;
  public authorId!: string;
  public body!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    taskId: { type: DataTypes.UUID, allowNull: false },
    authorId: { type: DataTypes.UUID, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: 'comment', modelName: 'Comment', timestamps: true }
);

export default Comment;
