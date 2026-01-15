import { Request } from 'express';
import z from 'zod';
import {
  partialTaskBodySchema,
  taskBodySchema,
  taskParamsSchema,
  taskQuerySchema,
} from './task.schemas';
import { TeamParams } from '../team/team.interfaces';
import { WhereOptions } from 'sequelize';
import { Task } from '../database/models';

type TaskBody = z.infer<typeof taskBodySchema>;

export type TaskData = z.infer<typeof partialTaskBodySchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
export type FilterData = z.infer<typeof taskQuerySchema>;

export type TaskRequest = Request<TeamParams, unknown, TaskBody>;
export type TaskTransformRequest = Request<TaskParams, unknown, TaskData>;

export type TaskListWhere = WhereOptions<Task>;

export interface CreateTaskData extends TaskBody {
  teamId: string;
  creatorId: string;
}
