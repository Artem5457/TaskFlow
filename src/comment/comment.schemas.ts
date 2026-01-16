import z from 'zod';
import { taskParamsSchema } from '../task/task.schemas';

export const commentBodySchema = z.object({
  body: z.string().nonempty(),
});

export const commentParamsSchema = taskParamsSchema.extend({
  commentId: z.string().uuid(),
});
