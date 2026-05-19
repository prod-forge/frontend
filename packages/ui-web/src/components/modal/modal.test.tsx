import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './modal';

describe('Modal', () => {
  it('renders nothing when isOpen=false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Confirm" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with the given title when isOpen=true', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Are you sure you want to delete?" />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading', { level: 2, name: /are you sure you want to delete\?/i })).toBeInTheDocument();
  });

  it('renders children inside the dialog', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Confirm">
        <p>Body text</p>
      </Modal>,
    );

    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('calls onClose when the overlay is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal isOpen onClose={onClose} title="Confirm" />);

    await user.click(screen.getByTestId('modal-overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the dialog body', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal isOpen onClose={onClose} title="Confirm">
        <p>Inner</p>
      </Modal>,
    );

    await user.click(screen.getByText('Inner'));
    await user.click(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal isOpen onClose={onClose} title="Confirm" />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not listen for Escape when closed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal isOpen={false} onClose={onClose} title="Confirm" />);

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus to the dialog container when opened', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Confirm" />);

    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('links the heading to the dialog via aria-labelledby', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Confirm" />);

    const dialog = screen.getByRole('dialog');
    const headingId = screen.getByRole('heading', { level: 2 }).id;
    expect(dialog).toHaveAttribute('aria-labelledby', headingId);
  });
});
