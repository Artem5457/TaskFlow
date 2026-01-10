import z from 'zod';

const nameSchema = z.string().trim().nonempty({ message: 'Enter team name' });
const descriptionSchema = z
  .string()
  .trim()
  .nonempty({ message: 'Description cannot be empty' })
  .optional();

const emailSchema = z
  .string()
  .trim()
  .nonempty()
  .email({ message: 'Invalid email address' })
  .transform((email) => email.toLowerCase())
  .optional();

// Body
export const teamBodySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const teamUpdateBodySchema = z.object({
  name: z.string().trim().nonempty().optional(),
  description: z.string().trim().nonempty().optional(),
});

export const userAdditionSchema = z
  .object({
    userId: z.string().uuid().nonempty().optional(),
    email: emailSchema,
  })
  .refine((data) => data.userId || data.email, {
    message: 'Must provide userId or email',
  });

// Params
export const teamParamsSchema = z.object({
  orgId: z.string().uuid().nonempty(),
  teamId: z.string().uuid().nonempty(),
});

export const orgTeamParamsSchema = z.object({
  orgId: z.string().uuid().nonempty(),
});

export const teamMemberDeleteParamsSchema = teamParamsSchema.extend({
  userId: z.string().uuid().nonempty(),
});
