import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TodoList } from './todo-list';

describe('TodoList', () => {
  it('renders its children', () => {
    render(
      <TodoList>
        <span data-testid="child">item</span>
      </TodoList>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders multiple children inside the grid container', () => {
    const { container } = render(
      <TodoList>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </TodoList>,
    );

    const grid = container.firstElementChild;
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('grid');
    expect(grid?.children).toHaveLength(3);
  });
});
