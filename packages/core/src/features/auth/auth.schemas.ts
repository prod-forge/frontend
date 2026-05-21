import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 3;

export const PASSWORD_MAX_LENGTH = 20;

export const NAME_MAX_LENGTH = 50;

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .refine((v) => /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(v), 'Enter a valid email');

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`);

const nameSchema = z.string().trim().max(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or fewer`);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export type LoginValues = z.infer<typeof loginSchema>;

export type RegisterValues = z.infer<typeof registerSchema>;
