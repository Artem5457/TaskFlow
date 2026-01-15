import { Request, Response } from 'express';
import { TaskService } from './task.service';
import {
  CreateTaskData,
  TaskParams,
  TaskRequest,
  TaskTransformRequest,
} from './task.interfaces';
import { AuthPayload } from '../auth/auth.interfaces';

type AuthRequest<T = TaskRequest> = T & { user: AuthPayload };

export class TaskController {
  constructor(private taskService: TaskService) {}

  async createTask(req: TaskRequest, res: Response): Promise<void> {
    const { teamId } = req.params;
    const userId = (req as AuthRequest).user.id;
    const data: CreateTaskData = { ...req.body, teamId, creatorId: userId };

    const task = await this.taskService.createTask(userId, teamId, data);

    res.status(201).json(task);
  }

  async getTaskList(req: TaskRequest, res: Response): Promise<void> {
    const { teamId } = req.params;

    const taskList = await this.taskService.getTaskList(teamId, req.query);

    res.status(200).json(taskList);
  }

  async getTask(req: Request<TaskParams>, res: Response): Promise<void> {
    const { taskId } = req.params;

    const task = await this.taskService.getTaskById(taskId);

    res.status(200).json(task);
  }

  async updateTask(req: TaskTransformRequest, res: Response): Promise<void> {
    const { taskId, teamId } = req.params;
    const userId = (req as AuthRequest<TaskTransformRequest>).user.id;
    const data = req.body;

    const updatedTask = await this.taskService.updateTask(
      teamId,
      userId,
      taskId,
      data
    );

    res.status(200).json(updatedTask);
  }

  async deleteTask(req: Request<TaskParams>, res: Response): Promise<void> {
    const { taskId } = req.params;
    const userId = (req as AuthRequest<TaskTransformRequest>).user.id;

    const deletedTask = await this.taskService.deleteTask(userId, taskId);

    res.status(200).json(deletedTask);
  }
}
