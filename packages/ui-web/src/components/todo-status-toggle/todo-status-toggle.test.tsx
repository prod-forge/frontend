import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TodoStatusToggle } from './todo-status-toggle';

const noop = (): void => undefined;

describe('TodoStatusToggle', () => {
  describe('negative cases', () => {
    it('does not expose aria-pressed, because the name already changes with the state', () => {
      render(<TodoStatusToggle completed onToggle={noop} />);

      expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
    });

    it('does not call onToggle before it is clicked', () => {
      const onToggle = vi.fn();
      render(<TodoStatusToggle completed={false} onToggle={onToggle} />);

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('renders "To Do" with the "mark as done" action when not completed', () => {
      render(<TodoStatusToggle completed={false} onToggle={noop} />);

      const button = screen.getByRole('button', { name: /mark as done/i });
      expect(button).toHaveTextContent('To Do');
    });

    it('renders "Done" with the "mark as to do" action when completed', () => {
      render(<TodoStatusToggle completed onToggle={noop} />);

      const button = screen.getByRole('button', { name: /mark as to do/i });
      expect(button).toHaveTextContent('Done');
    });

    it('starts the accessible name with the visible status (label in name)', () => {
      const { rerender } = render(<TodoStatusToggle completed={false} onToggle={noop} />);
      expect(screen.getByRole('button')).toHaveAccessibleName('To do, mark as done');

      rerender(<TodoStatusToggle completed onToggle={noop} />);
      expect(screen.getByRole('button')).toHaveAccessibleName('Done, mark as to do');
    });

    it('calls onToggle when clicked', async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();
      render(<TodoStatusToggle completed={false} onToggle={onToggle} />);

      await user.click(screen.getByRole('button'));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });
});
