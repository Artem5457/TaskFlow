import { Router } from 'express';
import { TeamController } from './team.controller';
import {
  authenticate,
  checkPermissions,
  organizationExist,
  validateBody,
  validateParams,
} from '../shared/utils/middlewares';
import {
  orgTeamParamsSchema,
  teamBodySchema,
  teamMemberDeleteParamsSchema,
  teamParamsSchema,
  teamUpdateBodySchema,
  userAdditionSchema,
} from './team.schemas';
import { TeamService } from './team.service';
import { taskRoutes } from '../task/task.route';

const router = Router({ mergeParams: true });

const teamService = new TeamService();
const teamController = new TeamController(teamService);

// Create a new team in organization (only ADMIN/OWNER)
router.post(
  '/',
  validateParams(orgTeamParamsSchema),
  validateBody(teamBodySchema),
  authenticate,
  organizationExist,
  checkPermissions,
  teamController.createTeam.bind(teamController)
);

// Get a team list of organization
router.get(
  '/',
  validateParams(orgTeamParamsSchema),
  authenticate,
  organizationExist,
  teamController.getOrganizationTeams.bind(teamController)
);

// Get team details
router.get(
  '/:teamId',
  validateParams(teamParamsSchema),
  authenticate,
  organizationExist,
  teamController.getTeam.bind(teamController)
);

// Update team (only ADMIN/OWNER)
router.patch(
  '/:teamId',
  validateParams(teamParamsSchema),
  validateBody(teamUpdateBodySchema),
  authenticate,
  organizationExist,
  checkPermissions,
  teamController.updateTeam.bind(teamController)
);

// Delete team (only ADMIN/OWNER)
router.delete(
  '/:teamId',
  validateParams(teamParamsSchema),
  authenticate,
  organizationExist,
  checkPermissions,
  teamController.deleteTeam.bind(teamController)
);

// Add a member to team (only ADMIN/OWNER)
router.post(
  '/:teamId/members',
  validateParams(teamParamsSchema),
  validateBody(userAdditionSchema),
  authenticate,
  organizationExist,
  checkPermissions,
  teamController.addMemberToTeam.bind(teamController)
);

// Delete a team member (only ADMIN/OWNER)
router.delete(
  '/:teamId/members/:userId',
  validateParams(teamMemberDeleteParamsSchema),
  authenticate,
  organizationExist,
  checkPermissions,
  teamController.deleteTeamMember.bind(teamController)
);

// Sub-routes
router.use('/:teamId/tasks', taskRoutes);

export const teamRoutes = router;
