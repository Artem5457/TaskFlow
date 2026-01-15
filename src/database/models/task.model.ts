import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db-instance';
import { OptionalTaskFields } from '../interfaces';
import { TaskPriority, TaskStatus } from '../../shared/interfaces';

interface TaskAttributes {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedToId?: string;
  creatorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type TaskCreationAttributes = Optional<TaskAttributes, OptionalTaskFields>;

class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: string;
  public teamId!: string;
  public title!: string;
  public description?: string;
  public status!: TaskStatus;
  public priority!: TaskPriority;
  public dueDate?: Date;
  public assignedToId?: string;
  public creatorId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    teamId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        TaskStatus.OPEN,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE
      ),
      defaultValue: TaskStatus.OPEN,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM(
        TaskPriority.LOW,
        TaskPriority.MIDDLE,
        TaskPriority.HIGH
      ),
      defaultValue: TaskPriority.MIDDLE,
      allowNull: false,
    },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    assignedToId: { type: DataTypes.UUID, allowNull: true },
    creatorId: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, tableName: 'task', modelName: 'Task', timestamps: true }
);

export default Task;
