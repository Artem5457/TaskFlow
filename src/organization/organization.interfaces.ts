import { Request } from 'express';
import { Invitation } from '../database/models';
import { Role } from '../shared/interfaces';

export interface UserInvitation {
  invitation: Invitation;
  token: string;
}

export interface InvitationToken {
  token: string;
  tokenHash: string;
}

export type OrganizationRequest = Request<
  { orgId: string },
  unknown,
  Partial<{
    name: string;
    email: string;
    token: string;
    role: InvitedMemberRole;
  }>
>;

export type InvitedMemberRole = Role.MEMBER | Role.ADMIN;
