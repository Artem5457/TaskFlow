import sequelize from '../database/config/db-instance';
import {
  OrganizationMember,
  Team,
  TeamMembership,
  User,
} from '../database/models';
import { Role } from '../shared/interfaces';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../shared/utils/errors';
import { logger } from '../shared/utils/logger';
import { TeamBody, TeamUpdateData, UserAdditionData } from './team.interfaces';

export class TeamService {
  async createTeam(
    orgId: string,
    userId: string,
    data: TeamBody
  ): Promise<Team> {
    logger.info('Starting team creation');
    const { name, description } = data;

    return sequelize.transaction(async (t) => {
      const team = await Team.create(
        { organizationId: orgId, name, description },
        { transaction: t }
      );

      await TeamMembership.create(
        { userId, teamId: team.id },
        { transaction: t }
      );

      logger.info(`Team '${name}' was created`);

      return team;
    });
  }

  async getOrganizationTeams(orgId: string): Promise<Team[]> {
    const teams = await Team.findAll({
      where: { organizationId: orgId },
    });

    logger.info({ orgId, teams: teams.length }, 'Organization teams fetched');

    return teams;
  }

  async getTeamDetails(
    userId: string,
    orgId: string,
    teamId: string
  ): Promise<Team> {
    const orgMember = await OrganizationMember.findOne({
      where: { organizationId: orgId, userId },
    });

    if (!orgMember) {
      throw new ForbiddenError(
        'User has no access to organization while fetching team'
      );
    }

    const team = await this.getTeamWithMembers(teamId, orgId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    logger.info('Team with members is found');
    return team;
  }

  async updateTeam(
    orgId: string,
    userId: string,
    teamId: string,
    data: TeamUpdateData
  ): Promise<Team> {
    const member = await this.getOrganizationMember(orgId, userId);

    this.ensureUserCanUpdateOrDeleteTeam(member);

    const team = await this.getTeam(orgId, teamId);

    await team.update(data);
    logger.info(`Team ${teamId} was successfully updated`);

    return team;
  }

  async deleteTeam(
    orgId: string,
    teamId: string,
    userId: string
  ): Promise<Team> {
    logger.info('Deleting team');

    const member = await this.getOrganizationMember(orgId, userId);
    this.ensureUserCanUpdateOrDeleteTeam(member);

    const team = await this.getTeam(orgId, teamId);
    await team.destroy();

    logger.info('Team deleted successfully');

    return team;
  }

  async addMemberToTeam(
    orgId: string,
    teamId: string,
    currentUserId: string,
    data: UserAdditionData
  ): Promise<TeamMembership> {
    logger.info('Adding a member to team');

    const [orgMember] = await this.getOrgMemberAndTeam(
      orgId,
      teamId,
      currentUserId
    );
    this.ensureUserCanAddOrDeleteMember(orgMember);

    const user = await this.getUser(data);
    await this.checkMembership(orgId, teamId, user.id);

    const teamMember = await TeamMembership.create({ teamId, userId: user.id });
    logger.info('Member added to team');

    return teamMember;
  }

  async deleteTeamMember(
    orgId: string,
    teamId: string,
    currentUserId: string,
    targetUserId: string
  ): Promise<TeamMembership> {
    logger.info('Deleting a member from team');

    const [orgMember] = await this.getOrgMemberAndTeam(
      orgId,
      teamId,
      currentUserId
    );
    this.ensureUserCanAddOrDeleteMember(orgMember);

    const user = await this.getUser({ userId: targetUserId });

    const membership = await OrganizationMember.findOne({
      where: { organizationId: orgId, userId: user.id },
    });
    if (!membership) {
      throw new ForbiddenError('User is not a member of this organization');
    }

    const teamMembership = await TeamMembership.findOne({
      where: { teamId, userId: user.id },
    });
    if (!teamMembership) {
      throw new NotFoundError('User is not a member of this team');
    }

    await teamMembership.destroy();

    logger.info('Member is removed from team');

    return teamMembership;
  }

  private async getTeamWithMembers(
    teamId: string,
    orgId: string
  ): Promise<Team | null> {
    const team = await Team.findOne({
      where: {
        id: teamId,
        organizationId: orgId,
      },
      include: {
        model: TeamMembership,
        as: 'members',
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
        ],
      },
    });

    return team;
  }

  private async getOrganizationMember(
    orgId: string,
    userId: string
  ): Promise<OrganizationMember> {
    const member = await OrganizationMember.findOne({
      where: { organizationId: orgId, userId },
    });

    if (!member) {
      throw new ForbiddenError('You are not member of this organization');
    }

    return member;
  }

  private ensureUserCanUpdateOrDeleteTeam(member: OrganizationMember): void {
    if (![Role.OWNER, Role.ADMIN].includes(member.role)) {
      throw new ForbiddenError('Only owner or admin can update or delete team');
    }
  }

  private async getTeam(orgId: string, teamId: string): Promise<Team> {
    const team = await Team.findOne({
      where: { id: teamId, organizationId: orgId },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    return team;
  }

  private async getOrgMemberAndTeam(
    orgId: string,
    teamId: string,
    userId: string
  ) {
    const [orgMember, team] = await Promise.all([
      OrganizationMember.findOne({ where: { organizationId: orgId, userId } }),
      Team.findOne({ where: { id: teamId, organizationId: orgId } }),
    ]);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    return [orgMember, team] as const;
  }

  private ensureUserCanAddOrDeleteMember(
    orgMember: OrganizationMember | null
  ): void {
    const hasPermissions =
      !orgMember || ![Role.OWNER, Role.ADMIN].includes(orgMember.role);

    if (hasPermissions) {
      throw new ForbiddenError('Only owner or admin can add or delete members');
    }
  }

  private async getUser(data: UserAdditionData): Promise<User> {
    const { userId, email } = data;
    const user = data.userId
      ? await User.findByPk(userId)
      : await User.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  private async checkMembership(orgId: string, teamId: string, userId: string) {
    const [membership, existingTeamMember] = await Promise.all([
      OrganizationMember.findOne({ where: { organizationId: orgId, userId } }),
      TeamMembership.findOne({ where: { teamId, userId } }),
    ]);

    if (!membership) {
      throw new ForbiddenError('User is not a member of this organization');
    }

    if (existingTeamMember) {
      throw new ConflictError('User is already a member of this team');
    }
  }
}
