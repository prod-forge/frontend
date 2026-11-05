import { describe, expect, it } from 'vitest';

import type { ErrorsState } from './errors.types';

import { clearErrors, dismissError, errorsReducer, pushError } from './errors.slice';

const initial = (): ErrorsState => errorsReducer(undefined, { type: '@@init' });

const withTwoErrors = (): ErrorsState => {
  const first = errorsReducer(initial(), pushError({ message: 'first', source: 'rtk', type: 'backend-error' }));

  return errorsReducer(first, pushError({ message: 'second', source: 'react', type: 'frontend-error' }));
};

describe('errors slice', () => {
  describe('negative cases', () => {
    it('starts with no errors', () => {
      expect(initial()).toEqual({ errors: [] });
    });

    it('keeps every error when dismissError gets an unknown id', () => {
      const state = errorsReducer(withTwoErrors(), dismissError('unknown-id'));

      expect(state.errors.map((e) => e.message)).toEqual(['first', 'second']);
    });

    it('defaults silent to false when it is not given', () => {
      const state = errorsReducer(initial(), pushError({ message: 'm', source: 'manual', type: 'frontend-error' }));

      expect(state.errors[0]?.silent).toBe(false);
    });
  });

  describe('positive cases', () => {
    it('pushError adds an error with a generated id and timestamp', () => {
      const state = errorsReducer(
        initial(),
        pushError({ message: 'boom', silent: true, source: 'rtk', type: 'backend-error' }),
      );

      expect(state.errors).toHaveLength(1);
      expect(state.errors[0]).toMatchObject({ message: 'boom', silent: true, source: 'rtk', type: 'backend-error' });
      expect(state.errors[0]?.id).toEqual(expect.any(String));
      expect(state.errors[0]?.timestamp).toEqual(expect.any(Number));
    });

    it('gives every pushed error a different id', () => {
      const [first, second] = withTwoErrors().errors;

      expect(first.id).not.toBe(second.id);
    });

    it('dismissError removes only the error with the given id', () => {
      const state = withTwoErrors();
      const firstId = state.errors[0]?.id ?? '';

      const next = errorsReducer(state, dismissError(firstId));

      expect(next.errors.map((e) => e.message)).toEqual(['second']);
    });

    it('clearErrors removes every error', () => {
      expect(errorsReducer(withTwoErrors(), clearErrors())).toEqual({ errors: [] });
    });
  });
});
