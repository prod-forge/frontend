import { describe, expect, it } from 'vitest';

import { loginSchema, NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, registerSchema } from './auth.schemas';

const firstMessage = (result: { error?: { issues: { message: string }[] } }): string | undefined =>
  result.error?.issues[0]?.message;

describe('loginSchema', () => {
  describe('negative cases', () => {
    it('rejects an empty email', () => {
      expect(firstMessage(loginSchema.safeParse({ email: '   ', password: 'pwd' }))).toBe('Email is required');
    });

    it.each(['plain', 'a@b', 'a b@c.com', '@b.com', 'a@.com'])('rejects the malformed email %s', (email) => {
      expect(firstMessage(loginSchema.safeParse({ email, password: 'pwd' }))).toBe('Enter a valid email');
    });

    it('rejects a password shorter than 3 characters', () => {
      expect(firstMessage(loginSchema.safeParse({ email: 'a@b.com', password: 'ab' }))).toBe(
        'Password must be at least 3 characters',
      );
    });

    it('rejects a password longer than the maximum', () => {
      const password = 'a'.repeat(PASSWORD_MAX_LENGTH + 1);

      expect(firstMessage(loginSchema.safeParse({ email: 'a@b.com', password }))).toBe(
        `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`,
      );
    });
  });

  describe('positive cases', () => {
    it('accepts a valid email and trims it', () => {
      const result = loginSchema.safeParse({ email: '  a@b.com  ', password: 'pwd' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ email: 'a@b.com', password: 'pwd' });
    });

    it('accepts a password of exactly the maximum length', () => {
      const password = 'a'.repeat(PASSWORD_MAX_LENGTH);

      expect(loginSchema.safeParse({ email: 'a@b.com', password }).success).toBe(true);
    });
  });
});

describe('registerSchema', () => {
  describe('negative cases', () => {
    it('rejects a name longer than the maximum', () => {
      const name = 'n'.repeat(NAME_MAX_LENGTH + 1);

      expect(firstMessage(registerSchema.safeParse({ email: 'a@b.com', name, password: 'pwd' }))).toBe(
        `Name must be ${NAME_MAX_LENGTH} characters or fewer`,
      );
    });
  });

  describe('positive cases', () => {
    it('accepts an empty name, because the name is optional', () => {
      expect(registerSchema.safeParse({ email: 'a@b.com', name: '', password: 'pwd' }).success).toBe(true);
    });

    it('trims the name', () => {
      const result = registerSchema.safeParse({ email: 'a@b.com', name: '  Ann  ', password: 'pwd' });

      expect(result.data?.name).toBe('Ann');
    });
  });
});
