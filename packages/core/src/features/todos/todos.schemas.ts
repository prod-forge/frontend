import { z } from 'zod';

export const TITLE_MAX_LENGTH = 50;

export const DESCRIPTION_MAX_LENGTH = 200;

export const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(TITLE_MAX_LENGTH, `Title must be ${TITLE_MAX_LENGTH} characters or fewer`);

export const descriptionSchema = z
  .string()
  .max(DESCRIPTION_MAX_LENGTH, `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`);
