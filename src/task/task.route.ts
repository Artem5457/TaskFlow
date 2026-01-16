import { Router } from 'express';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import {
  authenticate,
  organizationExist,
  teamExist,
  validateBody,
  validateParams,
  validateQuery,
} from '../shared/utils/middlewares';
import {
  partialTaskBodySchema,
  taskBodySchema,
  taskParamsSchema,
  taskQuerySchema,
} from './task.schemas';
import { teamParamsSchema } from '../team/team.schemas';
import { commentRoutes } from '../comment/comment.route';

const router = Router({ mergeParams: true });

const taskService = new TaskService();
const taskController = new TaskController(taskService);

// Create a task (only team member)
router.post(
  '/',
  validateParams(teamParamsSchema),
  validateBody(taskBodySchema),
  authenticate,
  organizationExist,
  teamExist,
  taskController.createTask.bind(taskController)
);

// Get a task list (with filter or sorting)
router.get(
  '/',
  validateParams(teamParamsSchema),
  validateQuery(taskQuerySchema),
  authenticate,
  organizationExist,
  teamExist,
  taskController.getTasks.bind(taskController)
);

// Get task details
router.get(
  '/:taskId',
  validateParams(taskParamsSchema),
  authenticate,
  organizationExist,
  teamExist,
  taskController.getTask.bind(taskController)
);

// Update a task (only assigned team member or team ADMIN)
router.patch(
  '/:taskId',
  validateParams(taskParamsSchema),
  validateBody(partialTaskBodySchema),
  authenticate,
  organizationExist,
  teamExist,
  taskController.updateTask.bind(taskController)
);

// Delete a task (only team ADMIN or task creator)
router.delete(
  '/:taskId',
  validateParams(taskParamsSchema),
  authenticate,
  organizationExist,
  teamExist,
  taskController.deleteTask.bind(taskController)
);

// Sub-routes
router.use('/:taskId/comments', commentRoutes);

export const taskRoutes = router;
