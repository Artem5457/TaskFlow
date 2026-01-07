import { Response } from 'express';
import { OrganizationService } from './organization.service';
import { AuthPayload } from '../auth/auth.interfaces';
import { Organization } from '../database/models';
import { OrganizationRequest } from './organization.interfaces';

type AuthRequest = OrganizationRequest & { user: AuthPayload };

const organizationService = new OrganizationService();

export class OrganizationController {
  async createOrganization(
    req: OrganizationRequest,
    res: Response<Organization>
  ): Promise<void> {
    const { name } = req.body;

    const organization = await organizationService.createOrg(
      (req as AuthRequest).user.id,
      name!
    );

    res.status(201).json(organization);
  }

  async getOrganizations(
    req: OrganizationRequest,
    res: Response<Organization[]>
  ): Promise<void> {
    const organizations = await organizationService.getUserOrgs(
      (req as AuthRequest).user.id
    );
    res.json(organizations);
  }

  async getOrganization(
    req: OrganizationRequest,
    res: Response
  ): Promise<void> {
    const { orgId } = req.params;
    const organization = await organizationService.getOrganizationById(
      orgId,
      (req as AuthRequest).user.id
    );

    res.json(organization);
  }

  async updateOrganization(
    req: OrganizationRequest,
    res: Response
  ): Promise<void> {
    const { orgId } = req.params;
    const { user } = req as AuthRequest;
    const { name } = req.body;

    await organizationService.updateOrg(orgId, user.id, { name: name! });

    res.sendStatus(204);
  }

  async deleteOrganization(
    req: OrganizationRequest,
    res: Response
  ): Promise<void> {
    const { orgId } = req.params;
    const { user } = req as AuthRequest;

    await organizationService.deleteOrg(orgId, user.id);
    res.sendStatus(204);
  }

  async inviteUser(req: OrganizationRequest, res: Response): Promise<void> {
    const { orgId } = req.params;
    const { email, role } = req.body;
    const inviterUserId = (req as AuthRequest).user.id;

    const { invitation, token } = await organizationService.inviteUser(
      orgId,
      inviterUserId,
      email!,
      role!
    );

    res.status(201).json({ invitation, token }); // Do not return 'token' on production
  }

  async acceptInvitation(
    req: OrganizationRequest,
    res: Response
  ): Promise<void> {
    const { orgId } = req.params;
    const { token, role } = req.body;

    await organizationService.acceptInvitation(
      orgId,
      (req as AuthRequest).user.id,
      token!,
      role!
    );

    res.sendStatus(204);
  }
}
