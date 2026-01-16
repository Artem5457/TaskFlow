import { NextFunction, Request, Response } from 'express';
import { Team } from '@database/models';
import { NotFoundError } from '../errors';
import { TeamParams } from '@team/team.interfaces';

export const teamExist = async (
  req: Request<TeamParams>,
  res: Response,
  next: NextFunction
) => {
  const { orgId, teamId } = req.params;

  const team = await Team.findOne({
    where: { id: teamId, organizationId: orgId },
  });

  if (!team) {
    throw new NotFoundError('Team not found in organization');
  }

  next();
};
