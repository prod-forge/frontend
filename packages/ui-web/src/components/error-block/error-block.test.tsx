import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBlock } from './error-block';

describe('ErrorBlock', () => {
  describe('negative cases', () => {
    it('renders no action slot when action is not provided', () => {
      render(<ErrorBlock message="Something went wrong" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders the error message', () => {
      render(<ErrorBlock message="Failed to load tasks. Please refresh the page." />);

      expect(screen.getByText('Failed to load tasks. Please refresh the page.')).toBeInTheDocument();
    });

    it('renders action content when provided', () => {
      render(<ErrorBlock action={<button type="button">Retry</button>} message="Something went wrong" />);

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('calls the action handler when the action button is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ErrorBlock
          action={
            <button onClick={onClick} type="button">
              Retry
            </button>
          }
          message="Something went wrong"
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
