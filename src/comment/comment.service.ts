import { Comment, Task, TeamMembership, User } from '../database/models';
import { ForbiddenError, NotFoundError } from '../shared/utils/errors';
import { CommentData } from './comment.interfaces';
import { logger } from '../shared/utils/logger';

export class CommentService {
  async addComment(
    userId: string,
    teamId: string,
    taskId: string,
    data: CommentData
  ): Promise<Comment> {
    const { body } = data;

    await this.checkTeamMembership(userId, teamId);
    await this.checkTeamTaskExisting(taskId, teamId);

    const comment = await Comment.create({
      body,
      taskId,
      authorId: userId,
    });

    logger.info('Comment created successfully');
    return comment;
  }

  async getCommentsList(teamId: string, taskId: string): Promise<Comment[]> {
    await this.checkTeamTaskExisting(taskId, teamId);

    const comments = await Comment.findAll({
      where: { taskId },
      include: {
        model: User,
        as: 'author',
        attributes: ['id', 'email', 'name', 'lastName'],
      },
    });

    logger.info('Comments list fetched successfully');
    return comments;
  }

  async deleteComment(
    userId: string,
    teamId: string,
    taskId: string,
    commentId: string
  ): Promise<Comment> {
    await this.checkTeamTaskExisting(taskId, teamId);

    const comment = await Comment.findOne({
      where: { id: commentId, taskId },
      include: {
        model: User,
        as: 'author',
        attributes: ['id', 'email', 'name', 'lastName'],
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment is not found');
    }

    const isAuthor = comment.authorId === userId;
    if (!isAuthor) {
      throw new ForbiddenError('You can delete only your own comment');
    }

    await comment.destroy();
    logger.info('Comment deleted successfully');

    return comment;
  }

  private async checkTeamMembership(
    userId: string,
    teamId: string
  ): Promise<void> {
    const teamMember = await TeamMembership.findOne({
      where: { userId, teamId },
    });

    if (!teamMember) {
      throw new ForbiddenError('User is not a team member');
    }
  }

  private async checkTeamTaskExisting(
    taskId: string,
    teamId: string
  ): Promise<void> {
    const teamTask = await Task.findOne({
      where: { id: taskId, teamId },
    });

    if (!teamTask) {
      throw new NotFoundError('Task not found in this team');
    }
  }
}
