import type { Mock } from 'vitest';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { logger } from 'logrock';
import { describe, expect, it, vi } from 'vitest';

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

describe('errorMiddleware', () => {
  describe('negative cases', () => {
    it('does not dispatch pushError for a regular action', () => {
      const { dispatch, invoke, next } = makeSetup();

      invoke({ type: 'some/regularAction' });

      expect(next).toHaveBeenCalledOnce();
      expect(dispatch).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('does not dispatch pushError for a fulfilled thunk', () => {
      const { dispatch, invoke } = makeSetup();

      invoke(testThunk.fulfilled(undefined, 'id'));

      expect(dispatch).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
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

      expect(logger.error).toHaveBeenCalledOnce();
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
      expect(logger.error).toHaveBeenCalledOnce();
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

      expect(logger.error).toHaveBeenCalledOnce();
      expect(logger.error).toHaveBeenCalledWith('Boom', 'test/thunk/rejected');
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
