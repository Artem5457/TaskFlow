import { Response } from 'express';
import { AuthPayload } from '../auth/auth.interfaces';
import { CommentRequest } from './comment.interfaces';
import { CommentService } from './comment.service';

type AuthRequest<T = CommentRequest> = T & { user: AuthPayload };

export class CommentController {
  constructor(private commentService: CommentService) {}

  async addComment(req: CommentRequest, res: Response): Promise<void> {
    const { teamId, taskId } = req.params;
    const userId = (req as AuthRequest).user.id;
    const data = req.body;

    const comment = await this.commentService.addComment(
      userId,
      teamId,
      taskId,
      data
    );

    res.status(201).json(comment);
  }

  async getComments(req: CommentRequest, res: Response): Promise<void> {
    const { teamId, taskId } = req.params;

    const comments = await this.commentService.getCommentsList(teamId, taskId);

    res.status(200).json(comments);
  }

  async deleteComment(req: CommentRequest, res: Response): Promise<void> {
    const { teamId, taskId, commentId } = req.params;
    const userId = (req as AuthRequest).user.id;

    const deletedComment = await this.commentService.deleteComment(
      userId,
      teamId,
      taskId,
      commentId
    );

    res.status(200).json(deletedComment);
  }
}
