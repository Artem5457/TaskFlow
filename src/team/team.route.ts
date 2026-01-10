import { Router } from 'express';
import { TeamController } from './team.controller';
import { validateBody, validateParams } from '../shared/utils/middlewares';
import {
  orgTeamParamsSchema,
  teamBodySchema,
  teamMemberDeleteParamsSchema,
  teamParamsSchema,
  teamUpdateBodySchema,
  userAdditionSchema,
} from './team.schemas';
import { authenticate } from '../shared/utils/middlewares/authenticate.middleware';
import { organizationExists } from '../shared/utils/middlewares/organization-exist.middleware';
import { TeamService } from './team.service';

const router = Router({ mergeParams: true });

const teamService = new TeamService();
const teamController = new TeamController(teamService);

// Create a new team in organization
router.post(
  '/',
  validateParams(orgTeamParamsSchema),
  validateBody(teamBodySchema),
  authenticate,
  organizationExists,
  teamController.createTeam.bind(teamController)
);

// Get a team list of organization
router.get(
  '/',
  validateParams(orgTeamParamsSchema),
  authenticate,
  organizationExists,
  teamController.getOrganizationTeams.bind(teamController)
);

// Get team details
router.get(
  '/:teamId',
  validateParams(teamParamsSchema),
  authenticate,
  organizationExists,
  teamController.getTeamDetails.bind(teamController)
);

// Update team (only ADMIN/OWNER)
router.patch(
  '/:teamId',
  validateParams(teamParamsSchema),
  validateBody(teamUpdateBodySchema),
  authenticate,
  organizationExists,
  teamController.updateTeam.bind(teamController)
);

// Delete team (only ADMIN/OWNER)
router.delete(
  '/:teamId',
  validateParams(teamParamsSchema),
  authenticate,
  organizationExists,
  teamController.deleteTeam.bind(teamController)
);

// Add a member to team (only ADMIN/OWNER)
router.post(
  '/:teamId/members',
  validateParams(teamParamsSchema),
  validateBody(userAdditionSchema),
  authenticate,
  organizationExists,
  teamController.addMemberToTeam.bind(teamController)
);

// Delete a team member (only ADMIN/OWNER)
router.delete(
  '/:teamId/members/:userId',
  validateParams(teamMemberDeleteParamsSchema),
  authenticate,
  organizationExists,
  teamController.deleteTeamMember.bind(teamController)
);

export const teamRoutes = router;
