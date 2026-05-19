import type { Todo } from '@prod-forge-todolist-frontend/core';
import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { TodoItem } from './todo-item';

const baseTodo: Todo = {
  completed: false,
  description: 'desc',
  id: 'abc-123',
  title: 'Buy milk',
};

const renderItem = (
  todo: Todo,
  onToggle: (id: string) => void = () => {
    /* empty */
  },
): RenderResult =>
  render(
    <MemoryRouter>
      <TodoItem onToggle={onToggle} todo={todo} />
    </MemoryRouter>,
  );

describe('TodoItem', () => {
  it('renders the title', () => {
    renderItem(baseTodo);

    expect(screen.getByRole('link', { name: 'Buy milk' })).toBeInTheDocument();
  });

  it('links the title and the open arrow to the todo detail page', () => {
    renderItem(baseTodo);

    expect(screen.getByRole('link', { name: 'Buy milk' })).toHaveAttribute('href', '/todo/abc-123');
    expect(screen.getByRole('link', { name: /open buy milk/i })).toHaveAttribute('href', '/todo/abc-123');
  });

  it('shows the "To Do" toggle when not completed', () => {
    renderItem(baseTodo);

    expect(screen.getByRole('button', { name: /mark as done/i })).toHaveTextContent('To Do');
  });

  it('shows the "Done" toggle when completed', () => {
    renderItem({ ...baseTodo, completed: true });

    expect(screen.getByRole('button', { name: /mark as to do/i })).toHaveTextContent('Done');
  });

  it('calls onToggle with the todo id when the toggle is clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    renderItem(baseTodo, onToggle);

    await user.click(screen.getByRole('button', { name: /mark as done/i }));

    expect(onToggle).toHaveBeenCalledWith('abc-123');
  });
});
