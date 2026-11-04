import { describe, expect, it } from 'vitest';

import { BackendError } from './backend-error';
import { serializeApiError } from './serialize-api-error';

describe('serializeApiError', () => {
  describe('negative cases', () => {
    it('omits status for an error without one', () => {
      expect(serializeApiError(new Error('Boom'))).not.toHaveProperty('status');
    });

    it('omits status when it is not a number', () => {
      const error = Object.assign(new Error('Boom'), { status: '500' });

      expect(serializeApiError(error)).not.toHaveProperty('status');
    });

    it('serializes a non-error value without status', () => {
      expect(serializeApiError('plain string')).toEqual({ message: 'plain string' });
    });
  });

  describe('positive cases', () => {
    it('keeps name, message, code and status of a BackendError', () => {
      const error = new BackendError({
        code: 'TODO_NOT_FOUND',
        details: {},
        message: 'raw',
        status: 404,
        traceId: 'trace',
      });

      expect(serializeApiError(error)).toMatchObject({
        code: 'TODO_NOT_FOUND',
        message: 'The requested item could not be found.',
        name: 'BackendError',
        status: 404,
      });
    });
  });
});
