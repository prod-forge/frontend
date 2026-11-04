import { descriptionSchema, titleSchema } from '@prod-forge-todolist-frontend/core';

import type { FieldErrors } from './field-errors';

import { toFieldErrors } from './field-errors';

export type TodoFields = {
  readonly description: string;
  readonly title: string;
};

type ParseResult<T> =
  { readonly data: T; readonly success: true } | { readonly errors: FieldErrors<TodoFields>; readonly success: false };

const schemas = { description: descriptionSchema, title: titleSchema } as const;

// Validates only the fields present in the patch, so an untouched seed value never blocks an edit of another field.
export const parseTodoPatch = (patch: Partial<TodoFields>): ParseResult<Partial<TodoFields>> => {
  const data: { -readonly [K in keyof TodoFields]?: string } = {};
  const issues: { message: string; path: (keyof TodoFields)[] }[] = [];

  for (const field of Object.keys(patch) as (keyof TodoFields)[]) {
    const result = schemas[field].safeParse(patch[field]);

    if (result.success) {
      data[field] = result.data;
    } else {
      issues.push(...result.error.issues.map((issue) => ({ message: issue.message, path: [field] })));
    }
  }

  return issues.length > 0 ? { errors: toFieldErrors<TodoFields>(issues), success: false } : { data, success: true };
};

export const parseTodoFields = (values: TodoFields): ParseResult<TodoFields> => {
  const result = parseTodoPatch(values);

  return result.success ? { data: { ...values, ...result.data }, success: true } : result;
};
