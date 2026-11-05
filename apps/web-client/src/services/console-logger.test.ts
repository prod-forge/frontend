import type { MockInstance } from 'vitest';

import { LoggerLevels } from 'logrock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { consoleLogger } from './console-logger';

// The shared setup mocks logrock without its LoggerLevels enum, which the logger compares against.
vi.mock('logrock', async () => vi.importActual('logrock'));

let errorSpy: MockInstance;
let warnSpy: MockInstance;
let logSpy: MockInstance;

beforeEach(() => {
  errorSpy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => undefined);
  warnSpy = vi.spyOn(globalThis.console, 'warn').mockImplementation(() => undefined);
  logSpy = vi.spyOn(globalThis.console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('consoleLogger', () => {
  describe('negative cases', () => {
    it('omits the context label when the context is empty', () => {
      consoleLogger(LoggerLevels.warn, 'slow response', '', false);

      expect(warnSpy).toHaveBeenCalledWith('slow response');
    });

    it('does not write errors to console.log', () => {
      consoleLogger(LoggerLevels.error, 'failed', 'api', true);

      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('writes errors to console.error with the context label', () => {
      consoleLogger(LoggerLevels.error, 'failed', 'api', true);

      expect(errorSpy).toHaveBeenCalledWith('[api] failed');
    });

    it('writes critical messages to console.error', () => {
      consoleLogger(LoggerLevels.critical, 'crashed', 'app', true);

      expect(errorSpy).toHaveBeenCalledWith('[app] crashed');
    });

    it('writes warnings to console.warn', () => {
      consoleLogger(LoggerLevels.warn, 'throttled', 'api', false);

      expect(warnSpy).toHaveBeenCalledWith('[api] throttled');
    });

    it.each([LoggerLevels.info, LoggerLevels.debug, LoggerLevels.log])(
      'writes %s messages to console.log with the level',
      (level) => {
        consoleLogger(level, 'GET /todos', 'api', false);

        expect(logSpy).toHaveBeenCalledWith(`[${level}] [api] GET /todos`);
      },
    );
  });
});
