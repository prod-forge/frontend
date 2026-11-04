export type FieldErrors<T> = Partial<Record<keyof T, string>>;

type ValidationIssue = {
  readonly message: string;
  readonly path: readonly PropertyKey[];
};

// Keeps the first message per field, the same way the web forms show one error under each input.
export const toFieldErrors = <T>(issues: readonly ValidationIssue[]): FieldErrors<T> => {
  const errors: FieldErrors<T> = {};

  for (const issue of issues) {
    const field = issue.path[0] as keyof T | undefined;

    if (field !== undefined && errors[field] === undefined) {
      errors[field] = issue.message;
    }
  }

  return errors;
};
