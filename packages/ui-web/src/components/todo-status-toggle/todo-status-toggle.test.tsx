import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TodoStatusToggle } from './todo-status-toggle';

describe('TodoStatusToggle', () => {
  it('renders "To Do" with aria-pressed=false when not completed', () => {
    render(
      <TodoStatusToggle
        completed={false}
        onToggle={() => {
          /* empty */
        }}
      />,
    );

    const button = screen.getByRole('button', { name: /mark as done/i });
    expect(button).toHaveTextContent('To Do');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders "Done" with aria-pressed=true when completed', () => {
    render(
      <TodoStatusToggle
        completed
        onToggle={() => {
          /* empty */
        }}
      />,
    );

    const button = screen.getByRole('button', { name: /mark as to do/i });
    expect(button).toHaveTextContent('Done');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<TodoStatusToggle completed={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('exposes a different aria-label depending on the current state', () => {
    const { rerender } = render(
      <TodoStatusToggle
        completed={false}
        onToggle={() => {
          /* empty */
        }}
      />,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Mark as done');

    rerender(
      <TodoStatusToggle
        completed
        onToggle={() => {
          /* empty */
        }}
      />,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Mark as to do');
  });
});
