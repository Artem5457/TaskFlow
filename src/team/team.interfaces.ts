import { Request } from 'express';
import z from 'zod';
import {
  teamBodySchema,
  teamMemberDeleteParamsSchema,
  teamParamsSchema,
  teamUpdateBodySchema,
  userAdditionSchema,
} from './team.schemas';

export type TeamBody = z.infer<typeof teamBodySchema>;
export type TeamParams = z.infer<typeof teamParamsSchema>;
export type TeamMemberDeleteParams = z.infer<
  typeof teamMemberDeleteParamsSchema
>;

export type TeamUpdateData = z.infer<typeof teamUpdateBodySchema>;
export type UserAdditionData = z.infer<typeof userAdditionSchema>;

export type TeamRequest = Request<TeamParams, unknown, TeamBody>;
export type TeamUpdateRequest = Request<TeamParams, unknown, TeamUpdateData>;
export type TeamMemberDeleteRequest = Request<TeamMemberDeleteParams>;
