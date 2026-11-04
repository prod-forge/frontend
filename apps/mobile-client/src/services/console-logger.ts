/* eslint-disable no-console -- this adapter is the single place where core's log calls reach the device console (Metro / Logcat / Xcode). */
import type { CoreLogger } from '@prod-forge-todolist-frontend/core';

const format = (context?: string): string => (context ? `[${context}]` : '[core]');

export const consoleLogger: CoreLogger = {
  debug: (message, context) => {
    if (__DEV__) {
      console.debug(format(context), message);
    }
  },
  error: (error, context) => {
    console.error(format(context), error);
  },
  warn: (message, context) => {
    console.warn(format(context), message);
  },
};
