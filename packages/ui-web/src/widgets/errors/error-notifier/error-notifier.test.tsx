import type { Mock } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorNotifier } from './error-notifier';

interface ErrorItem {
  id: string;
  message: string;
}

const makeError = (id: string, message: string): ErrorItem => ({ id, message });

const setup = (errors: ErrorItem[] = [], onDismiss: Mock = vi.fn()): { onDismiss: Mock } => {
  render(<ErrorNotifier errors={errors} onDismiss={onDismiss} />);

  return { onDismiss };
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
  });

  describe('positive cases', () => {
    it('renders a banner for the first error', () => {
      setup([makeError('1', 'First error')]);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    it('calls onDismiss with the error id when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const { onDismiss } = setup([makeError('1', 'Dismissable error')]);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(onDismiss).toHaveBeenCalledWith('1');
    });

    it('calls onDismiss with the first error id when multiple errors are present', async () => {
      const user = userEvent.setup();
      const { onDismiss } = setup([makeError('1', 'First error'), makeError('2', 'Second error')]);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(onDismiss).toHaveBeenCalledWith('1');
    });

    it('has an aria-live region for screen reader announcements', () => {
      setup([]);

      expect(document.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    });
  });
});
