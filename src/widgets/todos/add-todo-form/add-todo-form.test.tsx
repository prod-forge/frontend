import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '../../../features/todos/todos.schemas';
import { AddTodoForm } from './add-todo-form';

describe('AddTodoForm', () => {
  it('renders title and description inputs and an "Add task" submit button', () => {
    render(<AddTodoForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toHaveAttribute('type', 'submit');
  });

  it('submits the form with both fields', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddTodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'Buy milk');
    await user.type(screen.getByLabelText('Description'), 'Pick up 2 liters');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ description: 'Pick up 2 liters', title: 'Buy milk' });
  });

  it('submits with an empty description (optional field)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddTodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(onSubmit).toHaveBeenCalledWith({ description: '', title: 'Buy milk' });
  });

  it('shows an error and does not submit when the title is empty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddTodoForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
  });

  it('shows an error when the title exceeds the max length', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddTodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'a'.repeat(TITLE_MAX_LENGTH + 1));
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/50 characters or fewer/i);
  });

  it('shows an error when the description exceeds the max length', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddTodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'Valid title');
    await user.type(screen.getByLabelText('Description'), 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1));
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/200 characters or fewer/i);
  });

  it('resets fields after a successful submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddTodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'Buy milk');
    await user.type(screen.getByLabelText('Description'), 'desc');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });
});
