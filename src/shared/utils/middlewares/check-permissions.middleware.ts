import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { ForbiddenError } from '../errors';
import { OrgAuthRequest } from '@organization/organization.controller';
import { OrganizationMember } from '@database/models';
import { Role } from '@shared/interfaces';

export const checkPermissions = async (
  req: Request<{ orgId: string }>,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as OrgAuthRequest).user.id;
  const { orgId } = req.params;

  const membership = await OrganizationMember.findOne({
    where: { userId, organizationId: orgId },
  });

  if (!membership) {
    throw new ForbiddenError('You are not a member of organization');
  }

  const hasPermission = ![Role.OWNER, Role.ADMIN].includes(membership.role);

  if (hasPermission) {
    throw new ForbiddenError('Only ADMIN or OWNER has permissions');
  }

  next();
};
