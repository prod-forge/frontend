import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RetryButton } from './retry-button';

describe('RetryButton', () => {
  describe('negative cases', () => {
    it('does not call onClick before user interaction', () => {
      const onClick = vi.fn();
      render(<RetryButton onClick={onClick} />);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('renders with an accessible label', () => {
      render(<RetryButton onClick={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<RetryButton onClick={onClick} />);

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
