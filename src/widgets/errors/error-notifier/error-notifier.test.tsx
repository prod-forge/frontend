import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import type { AppError } from '../../../features/errors/errors.types';

import { errorsReducer } from '../../../features/errors/errors.slice';
import { ErrorNotifier } from './error-notifier';

const makeError = (id: string, message: string, silent = false): AppError => ({
  id,
  message,
  silent,
  source: 'rtk',
  timestamp: 0,
  type: 'frontend-error',
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setup = (errors: AppError[] = []) => {
  const store = configureStore({
    preloadedState: { errors: { errors } },
    reducer: { errors: errorsReducer },
  });

  render(
    <Provider store={store}>
      <ErrorNotifier />
    </Provider>,
  );

  return store;
};

describe('ErrorNotifier', () => {
  describe('negative cases', () => {
    it('renders no banner when the errors list is empty', () => {
      setup([]);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows only the first error when multiple errors are present', () => {
      setup([makeError('1', 'First error'), makeError('2', 'Second error')]);

      expect(screen.getAllByRole('alert')).toHaveLength(1);
      expect(screen.getByText('First error')).toBeInTheDocument();
      expect(screen.queryByText('Second error')).not.toBeInTheDocument();
    });

    it('renders no banner for a silent error', () => {
      setup([makeError('1', 'Silent error', true)]);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders no banner when all errors are silent', () => {
      setup([makeError('1', 'First silent', true), makeError('2', 'Second silent', true)]);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders a banner for the first error', () => {
      setup([makeError('1', 'First error')]);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    it('removes the banner after the dismiss button is clicked', async () => {
      const user = userEvent.setup();
      setup([makeError('1', 'Dismissable error')]);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the next error after the current one is dismissed', async () => {
      const user = userEvent.setup();
      setup([makeError('1', 'First error'), makeError('2', 'Second error')]);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(screen.queryByText('First error')).not.toBeInTheDocument();
      expect(screen.getByText('Second error')).toBeInTheDocument();
    });

    it('renders banner for a non-silent error even when silent errors are also present', () => {
      setup([makeError('1', 'Silent error', true), makeError('2', 'Visible error', false)]);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Visible error')).toBeInTheDocument();
      expect(screen.queryByText('Silent error')).not.toBeInTheDocument();
    });

    it('has an aria-live region for screen reader announcements', () => {
      setup([]);

      expect(document.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    });
  });
});
