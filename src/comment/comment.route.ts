import { Router } from 'express';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import {
  authenticate,
  organizationExist,
  teamExist,
  validateBody,
  validateParams,
} from '../shared/utils/middlewares';
import { taskParamsSchema } from '../task/task.schemas';
import { commentBodySchema, commentParamsSchema } from './comment.schemas';

const router = Router({ mergeParams: true });

const commentService = new CommentService();
const commentController = new CommentController(commentService);

// Add comment (only team member)
router.post(
  '/',
  validateParams(taskParamsSchema),
  validateBody(commentBodySchema),
  authenticate,
  organizationExist,
  teamExist,
  commentController.addComment.bind(commentController)
);

// Get comments list
router.get(
  '/',
  validateParams(taskParamsSchema),
  authenticate,
  organizationExist,
  teamExist,
  commentController.getComments.bind(commentController)
);

// Delete comment (only comment author)
router.delete(
  '/:commentId',
  validateParams(commentParamsSchema),
  authenticate,
  organizationExist,
  teamExist,
  commentController.deleteComment.bind(commentController)
);

export const commentRoutes = router;
