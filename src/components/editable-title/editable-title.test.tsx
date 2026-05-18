import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { TITLE_MAX_LENGTH, titleSchema } from '../../features/todos/todos.schemas';
import { EditableTitle } from './editable-title';

const renderTitle = (overrides: Partial<ComponentProps<typeof EditableTitle>> = {}): ReturnType<typeof render> =>
  render(<EditableTitle onSubmit={vi.fn()} schema={titleSchema} value="Buy milk" {...overrides} />);

describe('EditableTitle', () => {
  it('renders the value as a heading by default', () => {
    renderTitle();

    expect(screen.getByRole('heading', { level: 1, name: 'Buy milk' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('exposes an "Edit title" button', () => {
    renderTitle();

    expect(screen.getByRole('button', { name: /edit title/i })).toBeInTheDocument();
  });

  it('switches to an input when the edit button is clicked', async () => {
    const user = userEvent.setup();
    renderTitle();

    await user.click(screen.getByRole('button', { name: /edit title/i }));

    const input = screen.getByRole('textbox', { name: /title/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Buy milk');
    expect(screen.queryByRole('button', { name: /edit title/i })).not.toBeInTheDocument();
  });

  it('submits the trimmed value on Enter and exits edit mode', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderTitle({ onSubmit });

    await user.click(screen.getByRole('button', { name: /edit title/i }));
    const input = screen.getByRole('textbox', { name: /title/i });
    await user.clear(input);
    await user.type(input, '  Buy bread  {Enter}');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Buy bread');
    expect(screen.queryByRole('textbox', { name: /title/i })).not.toBeInTheDocument();
  });

  it('submits on blur (unfocus)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <div>
        <EditableTitle onSubmit={onSubmit} schema={titleSchema} value="Buy milk" />
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /edit title/i }));
    const input = screen.getByRole('textbox', { name: /title/i });
    await user.clear(input);
    await user.type(input, 'Buy bread');
    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(onSubmit).toHaveBeenCalledWith('Buy bread');
  });

  it('shows an error and stays in edit mode when the title exceeds the max length', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderTitle({ onSubmit });

    await user.click(screen.getByRole('button', { name: /edit title/i }));
    const input = screen.getByRole('textbox', { name: /title/i });
    await user.clear(input);
    await user.type(input, 'a'.repeat(TITLE_MAX_LENGTH + 1));
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/50 characters or fewer/i);
  });

  it('shows an error and stays in edit mode for an empty title', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderTitle({ onSubmit });

    await user.click(screen.getByRole('button', { name: /edit title/i }));
    const input = screen.getByRole('textbox', { name: /title/i });
    await user.clear(input);
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
  });

  it('cancels editing on Escape and reverts to the original value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderTitle({ onSubmit });

    await user.click(screen.getByRole('button', { name: /edit title/i }));
    const input = screen.getByRole('textbox', { name: /title/i });
    await user.clear(input);
    await user.type(input, 'Buy bread{Escape}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: /title/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Buy milk' })).toBeInTheDocument();
  });

  it('honors a custom schema passed via props', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const customSchema = z.string().trim().min(1, 'Required').max(5, 'Max 5 characters');
    renderTitle({ onSubmit, schema: customSchema, value: 'short' });

    await user.click(screen.getByRole('button', { name: /edit title/i }));
    const input = screen.getByRole('textbox', { name: /title/i });
    await user.clear(input);
    await user.type(input, 'too long{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/max 5 characters/i);
  });

  it('applies the maxLength attribute to the input when provided', async () => {
    const user = userEvent.setup();
    renderTitle({ maxLength: 100 });

    await user.click(screen.getByRole('button', { name: /edit title/i }));

    expect(screen.getByRole('textbox', { name: /title/i })).toHaveAttribute('maxLength', '100');
  });
});
