import sequelize from '../database/config/db-instance';
import {
  OrganizationMember,
  Team,
  TeamMembership,
  User,
} from '../database/models';
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

  async getTeamDetails(orgId: string, teamId: string): Promise<Team> {
    const team = await this.getTeamWithMembers(teamId, orgId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    logger.info('Team with members is found');
    return team;
  }

  async updateTeam(
    orgId: string,
    teamId: string,
    data: TeamUpdateData
  ): Promise<Team> {
    const team = await this.getTeamOrThrow(orgId, teamId);

    await team.update(data);
    logger.info(`Team ${teamId} was successfully updated`);

    return team;
  }

  async deleteTeam(orgId: string, teamId: string): Promise<Team> {
    logger.info('Deleting team');

    const team = await this.getTeamOrThrow(orgId, teamId);
    await team.destroy();

    logger.info('Team deleted successfully');

    return team;
  }

  async addMemberToTeam(
    orgId: string,
    teamId: string,
    data: UserAdditionData
  ): Promise<TeamMembership> {
    logger.info('Adding a member to team');

    await this.getTeamOrThrow(orgId, teamId);

    const user = await this.getUser(data);
    await this.checkMembership(teamId, user.id);

    const teamMember = await TeamMembership.create({ teamId, userId: user.id });
    logger.info('Member added to team');

    return teamMember;
  }

  async deleteTeamMember(
    orgId: string,
    teamId: string,
    targetUserId: string
  ): Promise<TeamMembership> {
    logger.info('Deleting a member from team');

    await this.getTeamOrThrow(orgId, teamId);
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

  private async getTeamOrThrow(orgId: string, teamId: string): Promise<Team> {
    const team = await Team.findOne({
      where: { id: teamId, organizationId: orgId },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    return team;
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

  private async checkMembership(teamId: string, userId: string) {
    const existingTeamMember = await TeamMembership.findOne({
      where: { teamId, userId },
    });

    if (existingTeamMember) {
      throw new ConflictError('User is already a member of this team');
    }
  }
}
