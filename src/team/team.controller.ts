import { Request, Response } from 'express';
import {
  TeamMemberDeleteParams,
  TeamMemberDeleteRequest,
  TeamParams,
  TeamRequest,
  TeamUpdateRequest,
  UserAdditionData,
} from './team.interfaces';
import { AuthPayload } from '../auth/auth.interfaces';
import { TeamService } from './team.service';

type AuthRequest<T = TeamRequest> = T & { user: AuthPayload };

export class TeamController {
  constructor(private teamService: TeamService) {}

  async createTeam(req: TeamRequest, res: Response): Promise<void> {
    const { name, description } = req.body;
    const { orgId } = req.params;
    const data = { name, description };
    const userId = (req as AuthRequest).user.id;

    const team = await this.teamService.createTeam(orgId, userId, data);

    res.status(201).json(team);
  }

  async getOrganizationTeams(req: TeamRequest, res: Response): Promise<void> {
    const { orgId } = req.params;
    const teams = await this.teamService.getOrganizationTeams(orgId);

    res.status(200).json(teams);
  }

  async getTeamDetails(req: TeamRequest, res: Response): Promise<void> {
    const { orgId, teamId } = req.params;
    const userId = (req as AuthRequest).user.id;

    const teamDetails = this.teamService.getTeamDetails(userId, orgId, teamId);

    res.status(200).json(teamDetails);
  }

  async updateTeam(req: TeamUpdateRequest, res: Response): Promise<void> {
    const { orgId, teamId } = req.params;
    const { name, description } = req.body;
    const userId = (req as AuthRequest).user.id;

    const data = { name, description };

    const updatedTeam = await this.teamService.updateTeam(
      orgId,
      userId,
      teamId,
      data
    );

    res.status(200).json(updatedTeam);
  }

  async deleteTeam(req: TeamUpdateRequest, res: Response): Promise<void> {
    const { orgId, teamId } = req.params;
    const userId = (req as AuthRequest).user.id;

    const deletedTeam = await this.teamService.deleteTeam(
      orgId,
      teamId,
      userId
    );

    res.status(200).json(deletedTeam);
  }

  async addMemberToTeam(
    req: Request<TeamParams, unknown, UserAdditionData>,
    res: Response
  ): Promise<void> {
    const { orgId, teamId } = req.params;
    const userId = (req as AuthRequest).user.id;
    const { email, userId: targetUserId } = req.body;

    const membership = await this.teamService.addMemberToTeam(
      orgId,
      teamId,
      userId,
      { email, userId: targetUserId }
    );

    res.status(201).json(membership);
  }

  async deleteTeamMember(
    req: Request<TeamMemberDeleteParams>,
    res: Response
  ): Promise<void> {
    const { orgId, teamId, userId: targetUserId } = req.params;
    const userId = (req as AuthRequest<TeamMemberDeleteRequest>).user.id;

    const deletedMember = await this.teamService.deleteTeamMember(
      orgId,
      teamId,
      userId,
      targetUserId
    );

    res.status(200).json(deletedMember);
  }
}
