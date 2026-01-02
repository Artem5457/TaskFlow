import { z } from 'zod';

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Field is required')
  .max(50, 'Must be at most 50 characters');

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be at most 100 characters')
  .superRefine((value, ctx) => {
    if (!/[A-Z]/.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one uppercase letter',
      });
    }

    if (!/\d/.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one number',
      });
    }

    if (!/[@$!%*?&]/.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one special character',
      });
    }
  });

const emailSchema = z
  .string()
  .email({ message: 'Invalid email address' })
  .transform((email) => email.toLowerCase());

export const registerSchema = z.object({
  name: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
