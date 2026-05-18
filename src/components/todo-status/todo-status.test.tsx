import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TodoStatus } from './todo-status';

describe('TodoStatus', () => {
  it('renders "Done" when completed', () => {
    render(<TodoStatus completed />);

    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders "To Do" when not completed', () => {
    render(<TodoStatus completed={false} />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('applies the ok styling when completed', () => {
    render(<TodoStatus completed />);

    expect(screen.getByText('Done')).toHaveClass('bg-ok-soft');
  });

  it('applies the muted styling when not completed', () => {
    render(<TodoStatus completed={false} />);

    expect(screen.getByText('To Do')).toHaveClass('bg-page-soft');
  });
});
