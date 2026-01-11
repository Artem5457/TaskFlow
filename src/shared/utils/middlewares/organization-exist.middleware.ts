import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import { Organization } from '@database/models';

export const organizationExists = async (
  req: Request<{ orgId: string }>,
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
