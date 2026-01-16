import { Request } from 'express';
import z from 'zod';
import { commentBodySchema, commentParamsSchema } from './comment.schemas';

export type CommentData = z.infer<typeof commentBodySchema>;
export type CommentParams = z.infer<typeof commentParamsSchema>;

export type CommentRequest = Request<CommentParams, unknown, CommentData>;
