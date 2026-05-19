import type { ComponentProps } from 'react';

import { DESCRIPTION_MAX_LENGTH, descriptionSchema } from '@prod-forge-todolist-frontend/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { EditableDescription } from './editable-description';

const renderDescription = (
  overrides: Partial<ComponentProps<typeof EditableDescription>> = {},
): ReturnType<typeof render> =>
  render(<EditableDescription onSubmit={vi.fn()} schema={descriptionSchema} value="Pick up milk" {...overrides} />);

describe('EditableDescription', () => {
  it('renders the value as paragraph text by default', () => {
    renderDescription();

    expect(screen.getByText('Pick up milk')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders an empty-state placeholder when value is empty', () => {
    renderDescription({ value: '' });

    expect(screen.getByText(/no description/i)).toBeInTheDocument();
  });

  it('exposes an "Edit description" button', () => {
    renderDescription();

    expect(screen.getByRole('button', { name: /edit description/i })).toBeInTheDocument();
  });

  it('switches to a textarea when the edit button is clicked', async () => {
    const user = userEvent.setup();
    renderDescription();

    await user.click(screen.getByRole('button', { name: /edit description/i }));

    const textarea = screen.getByRole('textbox', { name: /description/i });
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveValue('Pick up milk');
  });

  it('submits on Enter (without Shift) and exits edit mode', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderDescription({ onSubmit });

    await user.click(screen.getByRole('button', { name: /edit description/i }));
    const textarea = screen.getByRole('textbox', { name: /description/i });
    await user.clear(textarea);
    await user.type(textarea, 'Pick up bread{Enter}');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Pick up bread');
    expect(screen.queryByRole('textbox', { name: /description/i })).not.toBeInTheDocument();
  });

  it('inserts a newline on Shift+Enter without submitting', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderDescription({ onSubmit, value: 'Line one' });

    await user.click(screen.getByRole('button', { name: /edit description/i }));
    const textarea = screen.getByRole('textbox', { name: /description/i });
    await user.click(textarea);
    await user.keyboard('{End}{Shift>}{Enter}{/Shift}Line two');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Line one\nLine two');
  });

  it('submits on blur (unfocus)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <div>
        <EditableDescription onSubmit={onSubmit} schema={descriptionSchema} value="Pick up milk" />
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /edit description/i }));
    const textarea = screen.getByRole('textbox', { name: /description/i });
    await user.clear(textarea);
    await user.type(textarea, 'Pick up bread');
    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(onSubmit).toHaveBeenCalledWith('Pick up bread');
  });

  it('shows an error and stays in edit mode when the description exceeds the max length', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderDescription({ onSubmit, value: 'Short' });

    await user.click(screen.getByRole('button', { name: /edit description/i }));
    const textarea = screen.getByRole('textbox', { name: /description/i });
    await user.clear(textarea);
    await user.type(textarea, 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1));
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/200 characters or fewer/i);
  });

  it('allows submitting an empty description', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderDescription({ onSubmit });

    await user.click(screen.getByRole('button', { name: /edit description/i }));
    const textarea = screen.getByRole('textbox', { name: /description/i });
    await user.clear(textarea);
    await user.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('');
  });

  it('cancels editing on Escape and reverts to the original value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderDescription({ onSubmit });

    await user.click(screen.getByRole('button', { name: /edit description/i }));
    const textarea = screen.getByRole('textbox', { name: /description/i });
    await user.clear(textarea);
    await user.type(textarea, 'Pick up bread{Escape}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: /description/i })).not.toBeInTheDocument();
    expect(screen.getByText('Pick up milk')).toBeInTheDocument();
  });

  it('honors a custom schema passed via props', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const customSchema = z.string().trim().min(1, 'Required').max(40, 'Max 40 characters');
    renderDescription({ onSubmit, schema: customSchema, value: 'Some' });

    await user.click(screen.getByRole('button', { name: /edit description/i }));
    const textarea = screen.getByRole('textbox', { name: /description/i });
    await user.clear(textarea);
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
  });

  it('applies the maxLength attribute to the textarea when provided', async () => {
    const user = userEvent.setup();
    renderDescription({ maxLength: 250 });

    await user.click(screen.getByRole('button', { name: /edit description/i }));

    expect(screen.getByRole('textbox', { name: /description/i })).toHaveAttribute('maxLength', '250');
  });
});
