import crypto from 'crypto';
import sequelize from '../database/config/db-instance';
import {
  Invitation,
  Organization,
  OrganizationMember,
  User,
} from '../database/models';
import { InvitationStatus, Role } from '../shared/interfaces';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../shared/utils/errors';
import { JwtService } from '../shared/services/jwt.service';
import {
  InvitationToken,
  InvitedMemberRole,
  UserInvitation,
} from './organization.interfaces';
import { calcExpirationDate } from '../shared/utils/helpers';
import { getConfig } from '../shared/utils/getConfig';
import { Op } from 'sequelize';
import { logger } from '../shared/utils/logger';

const jwtService = new JwtService();

const { invitationTokenDaysValid } = getConfig();
const INVITATION_PERIOD_IN_MS = invitationTokenDaysValid * 24 * 60 * 60 * 1000;

export class OrganizationService {
  async createOrg(userId: string, name: string): Promise<Organization> {
    logger.info('Starting organization creation');

    return sequelize.transaction(async (t) => {
      const organization = await Organization.create(
        { name, ownerId: userId },
        { transaction: t }
      );

      await OrganizationMember.create(
        {
          userId,
          organizationId: organization.id,
          role: Role.OWNER,
        },
        { transaction: t }
      );

      logger.info(`Organization '${name}' was created`);

      return organization;
    });
  }

  async getUserOrgs(userId: string): Promise<Organization[]> {
    return Organization.findAll({
      include: [
        {
          model: OrganizationMember,
          where: { userId },
        },
      ],
    });
  }

  async getOrganizationById(
    orgId: string,
    userId: string
  ): Promise<Organization | null> {
    const member = await OrganizationMember.findOne({
      where: { organizationId: orgId, userId },
    });

    if (!member) {
      logger.warn(
        {
          userId,
          orgId,
        },
        'User has no access to organization'
      );
      throw new ForbiddenError('Access denied');
    }

    logger.info('Organization access granted');

    return Organization.findByPk(orgId);
  }

  async updateOrg(
    orgId: string,
    userId: string,
    data: { name: string }
  ): Promise<void> {
    logger.info('Updating organization');

    const member = await OrganizationMember.findOne({
      where: { organizationId: orgId, userId },
    });
    const hasPermission =
      !member || ![Role.OWNER, Role.ADMIN].includes(member.role);

    if (!hasPermission) {
      logger.warn(
        {
          role: member?.role,
        },
        'User has insufficient permissions to update organization'
      );
      throw new ForbiddenError('Only owner or admin can update organization');
    }

    await Organization.update(data, { where: { id: orgId } });

    logger.info('Organization is updated');
  }

  async deleteOrg(orgId: string, userId: string): Promise<void> {
    logger.warn({ orgId }, 'Deleting organization');

    const member = await OrganizationMember.findOne({
      where: { organizationId: orgId, userId, role: Role.OWNER },
    });

    if (!member) {
      logger.warn('User is not owner');
      throw new ForbiddenError('Only owner can delete organization');
    }

    await Organization.destroy({ where: { id: orgId } });

    logger.info('Organization deleted');
  }

  async inviteUser(
    organizationId: string,
    inviterUserId: string,
    email: string,
    role: InvitedMemberRole
  ): Promise<UserInvitation> {
    logger.info(
      {
        inviterUserId,
        orgId: organizationId,
        invitedUserEmail: email,
        invitedUserRole: role,
      },
      'Inviting user to organization'
    );

    await this.checkInviterPermissions(organizationId, inviterUserId);

    const [existingUser, existingInvitation] = await Promise.all([
      User.findOne({ where: { email } }),
      Invitation.findOne({
        where: {
          organizationId,
          email,
          status: InvitationStatus.PENDING,
        },
      }),
    ]);

    if (existingUser) {
      await this.checkExistingMember(organizationId, existingUser);
    }

    if (existingInvitation) {
      logger.warn('Invitation already exists');
      throw new ConflictError('Invitation already sent');
    }

    const { token, tokenHash } = this.generateInvitationToken();
    const expiresAt = new Date(calcExpirationDate(INVITATION_PERIOD_IN_MS));

    const invitation = await Invitation.create({
      organizationId,
      email,
      token: tokenHash,
      status: InvitationStatus.PENDING,
      invitedMemberRole: role,
      expiresAt,
    });

    logger.info('Invitation created');

    return { invitation, token };
  }

  async acceptInvitation(
    organizationId: string,
    userId: string,
    token: string,
    role: InvitedMemberRole
  ): Promise<void> {
    logger.info('Accepting invitation');

    await Invitation.update(
      { status: InvitationStatus.EXPIRED },
      {
        where: {
          organizationId,
          status: InvitationStatus.PENDING,
          expiresAt: { [Op.lte]: new Date() },
        },
      }
    );

    const invitation = await this.getPendingInvitation(organizationId);

    this.validateInvitationToken(token, invitation);

    const user = await this.getUserOrFail(userId);

    if (user.email !== invitation.email) {
      throw new ForbiddenError('Invitation email mismatch');
    }

    await this.ensureNotOrganizationMember(organizationId, userId);
    await this.addMemberAndAcceptInvitation(
      organizationId,
      userId,
      invitation,
      role
    );

    logger.info('Invitation accepted');
  }

  private async checkInviterPermissions(
    organizationId: string,
    inviterUserId: string
  ): Promise<void> {
    const member = await OrganizationMember.findOne({
      where: { organizationId, userId: inviterUserId },
    });

    if (!member) {
      throw new ForbiddenError('Only members can invite users');
    }
    if (member.role === Role.MEMBER) {
      throw new ForbiddenError('Insufficient permissions to invite users');
    }
  }

  private async checkExistingMember(organizationId: string, invitedUser: User) {
    const membership = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: invitedUser.id,
      },
    });

    if (membership) {
      throw new ConflictError('User is already a member of this organization');
    }
  }

  private generateInvitationToken(): InvitationToken {
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = jwtService.hashToken(token);

    return { token, tokenHash };
  }

  private async getPendingInvitation(
    organizationId: string
  ): Promise<Invitation> {
    const invitation = await Invitation.findOne({
      where: {
        organizationId,
        status: InvitationStatus.PENDING,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!invitation) {
      throw new NotFoundError(
        'Active invitation not found or invitation has expired'
      );
    }

    return invitation;
  }

  private validateInvitationToken(
    rawToken: string,
    invitation: Invitation
  ): void {
    const tokenValid = jwtService.verifyToken(rawToken, invitation.token);

    if (!tokenValid) {
      throw new UnauthorizedError('Invalid invitation token');
    }
  }

  private async getUserOrFail(userId: string): Promise<User> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new UnauthorizedError();
    }

    return user;
  }

  private async ensureNotOrganizationMember(
    organizationId: string,
    userId: string
  ): Promise<void> {
    const member = await OrganizationMember.findOne({
      where: { organizationId, userId },
    });

    if (member) {
      throw new ConflictError('User already member of organization');
    }
  }

  private async addMemberAndAcceptInvitation(
    organizationId: string,
    userId: string,
    invitation: Invitation,
    role: InvitedMemberRole
  ): Promise<void> {
    await sequelize.transaction(async (t) => {
      await OrganizationMember.create(
        {
          organizationId,
          userId,
          role,
        },
        { transaction: t }
      );

      await invitation.update(
        { status: InvitationStatus.ACCEPTED },
        { transaction: t }
      );
    });
  }
}
