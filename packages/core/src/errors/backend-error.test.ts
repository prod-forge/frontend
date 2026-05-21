import { describe, expect, it } from 'vitest';

import type { ResponseError } from '../features/errors/errors.types';

import { BackendError, isBackendErrorResponse } from './backend-error';

const makeResponse = (overrides: Partial<{ code: string; status: number; traceId: string }> = {}): ResponseError => ({
  code: 'INTERNAL_ERROR',
  details: {},
  message: 'Internal Server Error',
  status: 500,
  traceId: 'trace-123',
  ...overrides,
});

describe('BackendError', () => {
  describe('negative cases', () => {
    it('does not expose the raw backend message', () => {
      const error = new BackendError(makeResponse({ code: 'INTERNAL_ERROR' }));

      expect(error.message).not.toBe('Internal Server Error');
    });
  });

  describe('positive cases', () => {
    it('is an instance of Error', () => {
      expect(new BackendError(makeResponse())).toBeInstanceOf(Error);
    });

    it('sets name to "BackendError"', () => {
      expect(new BackendError(makeResponse()).name).toBe('BackendError');
    });

    it('sets code from the response', () => {
      expect(new BackendError(makeResponse({ code: 'TODO_NOT_FOUND' })).code).toBe('TODO_NOT_FOUND');
    });

    it('sets status from the response', () => {
      expect(new BackendError(makeResponse({ status: 404 })).status).toBe(404);
    });

    it('sets traceId from the response', () => {
      expect(new BackendError(makeResponse({ traceId: 'abc-xyz' })).traceId).toBe('abc-xyz');
    });

    it('uses fallback message for unknown error codes', () => {
      const error = new BackendError(makeResponse({ code: 'UNKNOWN_CODE' }));

      expect(error.message).toBe('Something went wrong. Please try again later.');
    });

    it.each([
      ['DATABASE_ERROR', 'A storage error occurred. Please try again later.'],
      ['DTO_VALIDATION_ERROR', 'Your request contains invalid data. Please check your input.'],
      ['FORBIDDEN', 'You do not have permission to perform this action.'],
      ['HTTP_EXCEPTION', 'An unexpected request error occurred.'],
      ['INFRA_FAILURE', 'A service is temporarily unavailable. Please try again later.'],
      ['INTERNAL_ERROR', 'Something went wrong on our end. Please try again later.'],
      ['REDIS_ERROR', 'A caching error occurred. Please try again later.'],
      ['TODO_NOT_FOUND', 'The requested item could not be found.'],
      ['USER_IS_NOT_AUTHORIZED', 'Please log in to continue.'],
      ['USER_NOT_FOUND', 'The requested user could not be found.'],
    ])('maps %s to the correct user-friendly message', (code, expected) => {
      expect(new BackendError(makeResponse({ code })).message).toBe(expected);
    });
  });
});

describe('isBackendErrorResponse', () => {
  describe('negative cases', () => {
    it('returns false for null', () => {
      expect(isBackendErrorResponse(null)).toBe(false);
    });

    it('returns false for a string', () => {
      expect(isBackendErrorResponse('error')).toBe(false);
    });

    it('returns false for a number', () => {
      expect(isBackendErrorResponse(500)).toBe(false);
    });

    it('returns false when code is missing', () => {
      expect(isBackendErrorResponse({ status: 500, traceId: 'x' })).toBe(false);
    });

    it('returns false when code is not a string', () => {
      expect(isBackendErrorResponse({ code: 500, status: 500, traceId: 'x' })).toBe(false);
    });

    it('returns false when status is missing', () => {
      expect(isBackendErrorResponse({ code: 'INTERNAL_ERROR', traceId: 'x' })).toBe(false);
    });

    it('returns false when traceId is missing', () => {
      expect(isBackendErrorResponse({ code: 'INTERNAL_ERROR', status: 500 })).toBe(false);
    });
  });

  describe('positive cases', () => {
    it('returns true for a valid backend error response', () => {
      expect(isBackendErrorResponse(makeResponse())).toBe(true);
    });
  });
});
