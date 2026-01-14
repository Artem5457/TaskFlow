import z from 'zod';
import { Role } from '../shared/interfaces';

const nameSchema = z.string().trim().min(1, 'Field is required');

const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Invalid email address' })
  .transform((email) => email.toLowerCase());

const tokenSchema = z
  .string()
  .trim()
  .length(128, 'Invalid token length')
  .regex(/^[0-9a-f]+$/, 'Invalid token format')
  .transform((t) => t.toLowerCase());

const roleEnum = z.enum([Role.MEMBER, Role.ADMIN]);

// Organization schemas
export const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
});

export const orgBodySchema = z.object({
  name: nameSchema,
});

export const inviteUserBodySchema = z.object({
  email: emailSchema,
  role: roleEnum,
});

export const acceptInvitationBodySchema = z.object({
  token: tokenSchema,
  role: roleEnum,
});
