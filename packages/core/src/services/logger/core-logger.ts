export type CoreLogger = {
  debug(message: string, context?: string): void;
  error(error: unknown, context?: string): void;
  warn(message: Record<string, string> | string, context?: string): void;
};
