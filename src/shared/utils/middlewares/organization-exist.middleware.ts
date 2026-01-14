import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import { Organization } from '@database/models';
import { TeamParams } from '@team/team.interfaces';

export const organizationExist = async (
  req: Request<TeamParams>,
  res: Response,
  next: NextFunction
) => {
  const { orgId } = req.params;

  const organization = await Organization.findByPk(orgId);

  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  next();
};
