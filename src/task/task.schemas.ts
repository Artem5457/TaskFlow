import z from 'zod';
import { TaskPriority, TaskStatus } from '../shared/interfaces';
import { teamParamsSchema } from '../team/team.schemas';

export const taskBodySchema = z.object({
  title: z.string().trim().nonempty().max(255),
  description: z.string().trim().nonempty().optional(),
  status: z
    .enum([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE])
    .default(TaskStatus.OPEN),
  priority: z
    .enum([TaskPriority.LOW, TaskPriority.MIDDLE, TaskPriority.HIGH])
    .default(TaskPriority.MIDDLE),
  dueDate: z
    .preprocess(
      (value) => (typeof value === 'string' ? new Date(value) : value),
      z.date()
    )
    .optional(),
  assignedToId: z.string().uuid().optional(),
});

export const partialTaskBodySchema = taskBodySchema.partial();

export const taskParamsSchema = teamParamsSchema.extend({
  taskId: z.string().uuid(),
});

export const taskQuerySchema = z.object({
  sort: z.enum(['createdAt', 'dueDate']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  title: z.string().trim().nonempty().optional(),
  status: z
    .enum([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE])
    .optional(),
  priority: z
    .enum([TaskPriority.LOW, TaskPriority.MIDDLE, TaskPriority.HIGH])
    .optional(),
  assignedToId: z.string().uuid().optional(),
});
