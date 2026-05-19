import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBanner } from './error-banner';

describe('ErrorBanner', () => {
  describe('negative cases', () => {
    it('renders no trailing slot when trailing is not provided', () => {
      render(<ErrorBanner message="Error" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders the error message', () => {
      render(<ErrorBanner message="Something went wrong" />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders with role="alert" for screen readers', () => {
      render(<ErrorBanner message="Error" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders trailing content when provided', () => {
      render(<ErrorBanner message="Error" trailing={<button type="button">Close</button>} />);

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('calls the trailing action when the trailing button is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ErrorBanner
          message="Error"
          trailing={
            <button onClick={onClick} type="button">
              Close
            </button>
          }
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
