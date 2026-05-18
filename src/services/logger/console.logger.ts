import { LoggerLevels, type Stdout } from 'logrock';

export const consoleLogger: Stdout = (level, message, ctx) => {
  const label = ctx ? `[${ctx}]` : '';
  const text = `${label} ${String(message)}`.trim();

  if (level === LoggerLevels.error) {
    // eslint-disable-next-line no-console
    console.error(text);
  } else if (level === LoggerLevels.critical) {
    // eslint-disable-next-line no-console
    console.error(text);
  } else if (level === LoggerLevels.warn) {
    // eslint-disable-next-line no-console
    console.warn(text);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[${level}] ${text}`);
  }
};
