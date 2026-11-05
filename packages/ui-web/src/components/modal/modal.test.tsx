import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './modal';

const ModalWithOpener = (): ReactNode => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">
        Open
      </button>
      <button type="button">Behind</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
        <button onClick={() => setIsOpen(false)} type="button">
          Cancel
        </button>
        <button type="button">Delete</button>
      </Modal>
    </>
  );
};

describe('Modal', () => {
  describe('negative cases', () => {
    it('renders nothing when isOpen=false', () => {
      render(<Modal isOpen={false} onClose={vi.fn()} title="Confirm" />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

    it('does not listen for Escape when closed', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={false} onClose={onClose} title="Confirm" />);

      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not let Tab leave the dialog after the last control', async () => {
      const user = userEvent.setup();
      render(<ModalWithOpener />);

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.tab();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();

      await user.tab();

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });

    it('does not let Shift+Tab leave the dialog before the first control', async () => {
      const user = userEvent.setup();
      render(<ModalWithOpener />);

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.tab();
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

      await user.tab({ shift: true });

      expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
    });

    it('keeps focus on the dialog when it has no focusable content', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button type="button">Behind</button>
          <Modal isOpen onClose={vi.fn()} title="Confirm" />
        </>,
      );

      await user.tab();

      expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('does not restore focus to an opener that left the page', () => {
      const { rerender } = render(
        <>
          <button type="button">Opener</button>
          <Modal isOpen={false} onClose={vi.fn()} title="Confirm" />
        </>,
      );
      screen.getByRole('button', { name: 'Opener' }).focus();
      rerender(<Modal isOpen onClose={vi.fn()} title="Confirm" />);

      rerender(<Modal isOpen={false} onClose={vi.fn()} title="Confirm" />);

      expect(document.body).toHaveFocus();
    });
  });

  describe('positive cases', () => {
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

    it('calls onClose when Escape is pressed', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen onClose={onClose} title="Confirm" />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('moves focus to the dialog container when opened', () => {
      render(<Modal isOpen onClose={vi.fn()} title="Confirm" />);

      expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('moves Tab from the dialog container to its first control', async () => {
      const user = userEvent.setup();
      render(<ModalWithOpener />);

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.tab();

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });

    it('returns focus to the opener when closed', async () => {
      const user = userEvent.setup();
      render(<ModalWithOpener />);

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
    });

    it('returns focus to the opener when closed with Escape', async () => {
      const user = userEvent.setup();
      render(<ModalWithOpener />);

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.keyboard('{Escape}');

      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
    });

    it('links the heading to the dialog via aria-labelledby', () => {
      render(<Modal isOpen onClose={vi.fn()} title="Confirm" />);

      const dialog = screen.getByRole('dialog');
      const headingId = screen.getByRole('heading', { level: 2 }).id;
      expect(dialog).toHaveAttribute('aria-labelledby', headingId);
    });
  });
});
