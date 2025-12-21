import User from './user.model';
import Organization from './organization.model';
import OrganizationMemberRole from './organization-member-role.model';
import Team from './team.model';
import TeamMembership from './team-membership.model';
import Task from './task.model';
import Comment from './comment.model';
import Invitation from './invitation.model';

/* ===== Associations ===== */

// USER ↔ ORGANIZATION
User.hasMany(Organization, { foreignKey: 'ownerId', as: 'ownedOrganizations' });
Organization.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(OrganizationMemberRole, { foreignKey: 'userId' });
OrganizationMemberRole.belongsTo(User, { foreignKey: 'userId' });

Organization.hasMany(OrganizationMemberRole, { foreignKey: 'organizationId' });
OrganizationMemberRole.belongsTo(Organization, {
  foreignKey: 'organizationId',
});

// INVITATIONS
Organization.hasMany(Invitation, { foreignKey: 'organizationId' });
Invitation.belongsTo(Organization, { foreignKey: 'organizationId' });

// TEAM ↔ ORGANIZATION
Organization.hasMany(Team, { foreignKey: 'organizationId' });
Team.belongsTo(Organization, { foreignKey: 'organizationId' });

// TEAM MEMBERSHIP
Team.hasMany(TeamMembership, { foreignKey: 'teamId' });
TeamMembership.belongsTo(Team, { foreignKey: 'teamId' });

User.hasMany(TeamMembership, { foreignKey: 'userId' });
TeamMembership.belongsTo(User, { foreignKey: 'userId' });

// TASK ↔ TEAM
Team.hasMany(Task, { foreignKey: 'teamId', as: 'tasks' });
Task.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// TASK ↔ USER
User.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

User.hasMany(Task, { foreignKey: 'assignedToId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignee' });

// COMMENTS
Task.hasMany(Comment, { foreignKey: 'taskId' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });

User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId' });

export {
  User,
  Organization,
  OrganizationMemberRole,
  Team,
  TeamMembership,
  Task,
  Comment,
  Invitation,
};
