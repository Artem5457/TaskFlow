import { Includeable, Op, Order } from 'sequelize';
import { Task, TeamMembership, User } from '../database/models';
import { ForbiddenError, NotFoundError } from '../shared/utils/errors';
import {
  CreateTaskData,
  FilterData,
  TaskData,
  TaskListWhere,
} from './task.interfaces';
import { logger } from '../shared/utils/logger';

export class TaskService {
  async createTask(
    userId: string,
    teamId: string,
    data: CreateTaskData
  ): Promise<Task> {
    const { assignedToId } = data;

    this.checkUserMembership(teamId, userId);
    this.checkAssignedUserMembership(teamId, assignedToId);

    const task = await Task.create({ ...data, teamId, creatorId: userId });

    logger.info('Task is created successfully');
    return task;
  }

  async getTasksList(teamId: string, filters: FilterData): Promise<Task[]> {
    const where = this.buildWhere(teamId, filters);
    const order = this.buildOrder(filters);
    const include = this.buildTaskInclude();

    const tasks = await Task.findAll({
      where,
      order,
      include,
    });

    logger.info({ teamId }, 'Task list fetched successfully');

    return tasks;
  }

  async getTaskById(taskId: string): Promise<Task> {
    const task = await this.getTaskOrThrow(taskId);

    logger.info('Task is found');
    return task;
  }

  async updateTask(
    teamId: string,
    userId: string,
    taskId: string,
    data: TaskData
  ): Promise<Task> {
    const { assignedToId } = data;

    const task = await this.getTaskOrThrow(taskId);
    this.checkAssignedUserMembership(teamId, assignedToId);

    const hasPermissions = this.checkUpdateTaskPermissions(task, userId);

    if (!hasPermissions) {
      throw new ForbiddenError(
        'Only task creator and assigned user can update a task'
      );
    }

    await task.update(data);
    logger.info({ taskId }, `Task updated successfully`);

    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<Task> {
    const task = await this.getTaskOrThrow(taskId);

    const isCreator = task.creatorId === userId;

    if (!isCreator) {
      throw new ForbiddenError('Only task creator can delete a task');
    }

    await task.destroy();
    logger.info('Task deleted successfully');

    return task;
  }

  private buildWhere(teamId: string, filters: FilterData): TaskListWhere {
    const { status, priority, assignedToId, title } = filters;

    const where: TaskListWhere = { teamId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (title) where.title = { [Op.iLike]: `%${title}%` };

    return where;
  }

  private buildOrder(filters: FilterData): Order {
    const { sort, order } = filters;

    return sort
      ? [[sort, (order || 'asc').toUpperCase()]]
      : [['createdAt', 'DESC']];
  }

  private buildTaskInclude(): Includeable[] {
    const include = [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'name', 'lastName'],
      },
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'email', 'name', 'lastName'],
      },
    ];

    return include;
  }

  private async getTaskOrThrow(taskId: string): Promise<Task> {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  private checkUpdateTaskPermissions(task: Task, userId: string): boolean {
    const isAssignedUser = task.assignedToId === userId;
    const isCreator = task.creatorId === userId;
    const hasPermissions = isAssignedUser || isCreator;

    return hasPermissions;
  }

  private async checkUserMembership(
    teamId: string,
    userId: string
  ): Promise<void> {
    const teamMember = await TeamMembership.findOne({
      where: { teamId, userId },
    });

    if (!teamMember) {
      throw new ForbiddenError('User is not a team member');
    }
  }

  private async checkAssignedUserMembership(
    teamId: string,
    assignedToId?: string
  ): Promise<void> {
    if (assignedToId) {
      const assignedUser = await TeamMembership.findOne({
        where: { teamId, userId: assignedToId },
      });

      if (!assignedUser) {
        throw new ForbiddenError('Assigned user is not a team member');
      }
    }
  }
}
