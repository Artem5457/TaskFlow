import { NextFunction, Request, Response } from 'express';
import { Organization } from '../../../database/models';
import { NotFoundError } from '../errors';

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
