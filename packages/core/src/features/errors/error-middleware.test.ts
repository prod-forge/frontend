import type { Mock } from 'vitest';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';

import { getCoreConfig } from '../../config/core-config';
import { errorMiddleware } from './error-middleware';

const testThunk = createAsyncThunk('test/thunk', () => {
  return;
});

const makeSetup = (): { dispatch: Mock; invoke: (action: unknown) => unknown; next: Mock } => {
  const dispatch = vi.fn();
  const next = vi.fn().mockReturnValue('next-result');
  const invoke = (action: unknown): unknown => errorMiddleware({ dispatch, getState: vi.fn() })(next)(action);

  return { dispatch, invoke, next };
};

const makeRejectedAction = (error: Record<string, unknown>): Record<string, unknown> => ({
  error,
  meta: { aborted: false, arg: undefined, condition: false, requestId: 'id', requestStatus: 'rejected' },
  type: 'todos/fetchAll/rejected',
});

const makeRejectedWithValue = (payload: Record<string, unknown>): Record<string, unknown> => ({
  error: { message: 'Rejected' },
  meta: {
    aborted: false,
    arg: 'some-id',
    condition: false,
    rejectedWithValue: true,
    requestId: 'id',
    requestStatus: 'rejected',
  },
  payload,
  type: 'todos/action/rejected',
});

describe('errorMiddleware', () => {
  describe('negative cases', () => {
    it('does not dispatch pushError for a regular action', () => {
      const { dispatch, invoke, next } = makeSetup();

      invoke({ type: 'some/regularAction' });

      expect(next).toHaveBeenCalledOnce();
      expect(dispatch).not.toHaveBeenCalled();
      expect(getCoreConfig().logger.error).not.toHaveBeenCalled();
    });

    it('does not dispatch pushError for a fulfilled thunk', () => {
      const { dispatch, invoke } = makeSetup();

      invoke(testThunk.fulfilled(undefined, 'id'));

      expect(dispatch).not.toHaveBeenCalled();
      expect(getCoreConfig().logger.error).not.toHaveBeenCalled();
    });

    it('does not report a BackendError with a 4xx status', () => {
      const { dispatch, invoke } = makeSetup();

      invoke(makeRejectedAction({ code: 'TODO_NOT_FOUND', message: 'Not found', name: 'BackendError', status: 404 }));

      expect(getCoreConfig().reportError).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledOnce();
    });

    it('does not report an ApiError with a 4xx status', () => {
      const { invoke } = makeSetup();

      invoke(makeRejectedAction({ message: 'HTTP 422', name: 'ApiError', status: 422 }));

      expect(getCoreConfig().reportError).not.toHaveBeenCalled();
    });

    it('does not report a rejection marked silent', () => {
      const { dispatch, invoke } = makeSetup();

      invoke(makeRejectedWithValue({ silent: true }));

      expect(getCoreConfig().reportError).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledOnce();
    });

    it('does not report a not-found rejection', () => {
      const { invoke } = makeSetup();

      invoke(makeRejectedWithValue({ kind: 'not-found' }));

      expect(getCoreConfig().reportError).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('reports a rejectWithValue rejection that is neither silent nor not-found', () => {
      const { invoke } = makeSetup();

      invoke(makeRejectedWithValue({ kind: 'error' }));

      expect(getCoreConfig().reportError).toHaveBeenCalledOnce();
    });

    it('reports an error with a 5xx status', () => {
      const { invoke } = makeSetup();

      invoke(makeRejectedAction({ code: 'INTERNAL_ERROR', message: 'Server down', name: 'BackendError', status: 503 }));

      expect(getCoreConfig().reportError).toHaveBeenCalledOnce();
      expect(getCoreConfig().reportError).toHaveBeenCalledWith(
        new Error('Server down'),
        expect.objectContaining({
          action: 'todos/fetchAll/rejected',
          errorCode: 'INTERNAL_ERROR',
          errorName: 'BackendError',
        }),
      );
    });

    it('reports an error without a status', () => {
      const { invoke } = makeSetup();

      invoke(testThunk.rejected(new Error('Boom'), 'id'));

      expect(getCoreConfig().reportError).toHaveBeenCalledOnce();
    });

    it('dispatches pushError with the error message when a thunk is rejected', () => {
      const { dispatch, invoke } = makeSetup();

      invoke(testThunk.rejected(new Error('Network failure'), 'id'));

      expect(dispatch).toHaveBeenCalledOnce();
      const [action] = dispatch.mock.calls[0] as [
        { payload: { message: string; silent: boolean; source: string }; type: string },
      ];
      expect(action.type).toBe('errors/pushError');
      expect(action.payload.message).toBe('Network failure');
      expect(action.payload.source).toBe('rtk');
      expect(action.payload.silent).toBe(false);
    });

    it('calls logger.error even when the error is silent', () => {
      const { invoke } = makeSetup();

      const silentAction = {
        error: { message: 'Not found' },
        meta: {
          aborted: false,
          arg: 'some-id',
          condition: false,
          rejectedWithValue: true,
          requestId: 'id',
          requestStatus: 'rejected',
        },
        payload: { kind: 'not-found', silent: true },
        type: 'todos/fetchById/rejected',
      };
      invoke(silentAction);

      expect(getCoreConfig().logger.error).toHaveBeenCalledOnce();
    });

    it('dispatches pushError with silent:true when rejectWithValue payload has silent:true', () => {
      const { dispatch, invoke } = makeSetup();

      const silentAction = {
        error: { message: 'Rejected' },
        meta: {
          aborted: false,
          arg: 'some-id',
          condition: false,
          rejectedWithValue: true,
          requestId: 'id',
          requestStatus: 'rejected',
        },
        payload: { kind: 'not-found', silent: true },
        type: 'todos/fetchById/rejected',
      };
      invoke(silentAction);

      expect(dispatch).toHaveBeenCalledOnce();
      const [action] = dispatch.mock.calls[0] as [{ payload: { silent: boolean }; type: string }];
      expect(action.payload.silent).toBe(true);
      expect(getCoreConfig().logger.error).toHaveBeenCalledOnce();
    });

    it('dispatches pushError with silent:false when rejectWithValue payload has no silent flag', () => {
      const { dispatch, invoke } = makeSetup();

      const nonSilentAction = {
        error: { message: 'Rejected' },
        meta: {
          aborted: false,
          arg: 'some-id',
          condition: false,
          rejectedWithValue: true,
          requestId: 'id',
          requestStatus: 'rejected',
        },
        payload: { kind: 'error' },
        type: 'todos/fetchById/rejected',
      };
      invoke(nonSilentAction);

      expect(dispatch).toHaveBeenCalledOnce();
      const [action] = dispatch.mock.calls[0] as [{ payload: { silent: boolean }; type: string }];
      expect(action.payload.silent).toBe(false);
    });

    it('uses fallback message when error.message is absent', () => {
      const { dispatch, invoke } = makeSetup();

      const action = {
        error: {},
        meta: { aborted: false, arg: undefined, condition: false, requestId: 'id', requestStatus: 'rejected' },
        type: 'test/thunk/rejected',
      };
      invoke(action);

      expect(dispatch).toHaveBeenCalledOnce();
      const [dispatched] = dispatch.mock.calls[0] as [{ payload: { message: string } }];
      expect(dispatched.payload.message).toBe('Something went wrong');
    });

    it('calls logger.error with the message and action type as context', () => {
      const { invoke } = makeSetup();

      invoke(testThunk.rejected(new Error('Boom'), 'id'));

      expect(getCoreConfig().logger.error).toHaveBeenCalledOnce();
      expect(getCoreConfig().logger.error).toHaveBeenCalledWith('Boom', 'test/thunk/rejected');
    });

    it('calls next before dispatching pushError', () => {
      const { dispatch, invoke, next } = makeSetup();
      const callOrder: string[] = [];

      next.mockImplementation(() => callOrder.push('next'));
      dispatch.mockImplementation(() => callOrder.push('dispatch'));

      invoke(testThunk.rejected(new Error('err'), 'id'));

      expect(callOrder).toEqual(['next', 'dispatch']);
    });

    it('returns the result of next(action)', () => {
      const { invoke } = makeSetup();

      expect(invoke({ type: 'any' })).toBe('next-result');
    });

    it('dispatches pushError with type:"backend-error" when error name is BackendError', () => {
      const { dispatch, invoke } = makeSetup();

      const backendAction = {
        error: { code: 'TODO_NOT_FOUND', message: 'The requested item could not be found.', name: 'BackendError' },
        meta: { aborted: false, arg: 'some-id', condition: false, requestId: 'id', requestStatus: 'rejected' },
        type: 'todos/fetchById/rejected',
      };
      invoke(backendAction);

      const [action] = dispatch.mock.calls[0] as [{ payload: { type: string } }];
      expect(action.payload.type).toBe('backend-error');
    });

    it('dispatches pushError with type:"frontend-error" when error is not a BackendError', () => {
      const { dispatch, invoke } = makeSetup();

      invoke(testThunk.rejected(new Error('Network failure'), 'id'));

      const [action] = dispatch.mock.calls[0] as [{ payload: { type: string } }];
      expect(action.payload.type).toBe('frontend-error');
    });
  });
});
