import { describe, expect, it } from 'vitest';

import { DESCRIPTION_MAX_LENGTH, descriptionSchema, TITLE_MAX_LENGTH, titleSchema } from './todos.schemas';

describe('titleSchema', () => {
  describe('negative cases', () => {
    it('rejects a title made only of whitespace', () => {
      expect(titleSchema.safeParse('   ').error?.issues[0]?.message).toBe('Title is required');
    });

    it('rejects a title longer than the maximum', () => {
      expect(titleSchema.safeParse('t'.repeat(TITLE_MAX_LENGTH + 1)).error?.issues[0]?.message).toBe(
        `Title must be ${TITLE_MAX_LENGTH} characters or fewer`,
      );
    });
  });

  describe('positive cases', () => {
    it('trims the title', () => {
      expect(titleSchema.parse('  Buy milk  ')).toBe('Buy milk');
    });

    it('accepts a title of exactly the maximum length after trimming', () => {
      expect(titleSchema.safeParse(` ${'t'.repeat(TITLE_MAX_LENGTH)} `).success).toBe(true);
    });
  });
});

describe('descriptionSchema', () => {
  describe('negative cases', () => {
    it('rejects a description longer than the maximum', () => {
      expect(descriptionSchema.safeParse('d'.repeat(DESCRIPTION_MAX_LENGTH + 1)).error?.issues[0]?.message).toBe(
        `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`,
      );
    });
  });

  describe('positive cases', () => {
    it('accepts an empty description', () => {
      expect(descriptionSchema.parse('')).toBe('');
    });

    it('keeps surrounding whitespace, because a description is free text', () => {
      expect(descriptionSchema.parse('  note  ')).toBe('  note  ');
    });
  });
});
