import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import {
  authenticate,
  validateBody,
  validateParams,
} from '../shared/utils/middlewares';
import {
  acceptInvitationBodySchema,
  inviteUserBodySchema,
  orgBodySchema,
  orgParamsSchema,
} from './organization.schemas';
import { teamRoutes } from '../team/team.route';

const router = Router();

const organizationController = new OrganizationController();

// Create a new organization
router.post(
  '/',
  validateBody(orgBodySchema),
  authenticate,
  organizationController.createOrganization
);

// Get a list of all organizations
router.get('/', authenticate, organizationController.getOrganizations);

// Get a specific organization by ID
router.get(
  '/:orgId',
  validateParams(orgParamsSchema),
  authenticate,
  organizationController.getOrganization
);

// Update an existing organization
router.patch(
  '/:orgId',
  validateParams(orgParamsSchema),
  validateBody(orgBodySchema),
  authenticate,
  organizationController.updateOrganization
);

// Delete an organization by ID
router.delete(
  '/:orgId',
  validateParams(orgParamsSchema),
  authenticate,
  organizationController.deleteOrganization
);

// Invite a user to the organization
router.post(
  '/:orgId/invite',
  validateParams(orgParamsSchema),
  validateBody(inviteUserBodySchema),
  authenticate,
  organizationController.inviteUser
);

// Accept an invitation to join the organization
router.post(
  '/:orgId/accept',
  validateParams(orgParamsSchema),
  validateBody(acceptInvitationBodySchema),
  authenticate,
  organizationController.acceptInvitation
);

// Sub-routes
router.use('/:orgId/teams', teamRoutes);

export const organizationRoutes = router;
