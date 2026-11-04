import type { Todo } from '@prod-forge-todolist-frontend/core';
import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { TodoItem } from './todo-item';

const TEST_ASSETS_URL = 'http://test-assets';

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
  onDelete?: (id: string) => void,
): RenderResult =>
  render(
    <MemoryRouter>
      <TodoItem onDelete={onDelete} onToggle={onToggle} todo={todo} />
    </MemoryRouter>,
  );

describe('TodoItem', () => {
  beforeAll(() => {
    vi.stubEnv('VITE_ASSETS_BASE_URL', TEST_ASSETS_URL);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

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

  it('shows the todo icon for an incomplete todo', () => {
    renderItem(baseTodo);

    const icon = screen.getByRole('img', { name: 'Todo' });
    expect(icon).toHaveAttribute('src', `${TEST_ASSETS_URL}/todo.svg`);
  });

  it('shows the completed icon for a completed todo', () => {
    renderItem({ ...baseTodo, completed: true });

    const icon = screen.getByRole('img', { name: 'Completed' });
    expect(icon).toHaveAttribute('src', `${TEST_ASSETS_URL}/completed.svg`);
  });

  describe('delete button', () => {
    describe('negative cases', () => {
      it('does not render the delete button when onDelete is not provided', () => {
        renderItem(baseTodo);

        expect(screen.queryByRole('button', { name: 'Delete todo' })).not.toBeInTheDocument();
      });

      it('does not call onToggle when the delete button is clicked', async () => {
        const onToggle = vi.fn();
        const user = userEvent.setup();
        renderItem(baseTodo, onToggle, vi.fn());

        await user.click(screen.getByRole('button', { name: 'Delete todo' }));

        expect(onToggle).not.toHaveBeenCalled();
      });
    });

    describe('positive cases', () => {
      it('renders the delete button when onDelete is provided', () => {
        renderItem(baseTodo, undefined, vi.fn());

        expect(screen.getByRole('button', { name: 'Delete todo' })).toBeInTheDocument();
      });

      it('calls onDelete with the todo id when the delete button is clicked', async () => {
        const onDelete = vi.fn();
        const user = userEvent.setup();
        renderItem(baseTodo, undefined, onDelete);

        await user.click(screen.getByRole('button', { name: 'Delete todo' }));

        expect(onDelete).toHaveBeenCalledWith('abc-123');
      });
    });
  });
});
