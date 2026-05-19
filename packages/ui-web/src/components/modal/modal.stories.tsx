import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Button } from '../button/button';
import { Modal } from './modal';

const meta = {
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Components/Modal',
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = (): void => undefined;

export const Open: Story = {
  args: {
    children: <p>This action cannot be undone.</p>,
    isOpen: true,
    onClose: noop,
    title: 'Are you sure you want to delete?',
  },
};

export const TitleOnly: Story = {
  args: {
    isOpen: true,
    onClose: noop,
    title: 'Confirm action',
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <>
        <p>Some descriptive text explaining the consequences of this action.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={noop} variant="secondary">
            Cancel
          </Button>
          <Button onClick={noop} variant="danger">
            Confirm
          </Button>
        </div>
      </>
    ),
    isOpen: true,
    onClose: noop,
    title: 'Confirm delete',
  },
};

export const Interactive: Story = {
  args: {
    isOpen: false,
    onClose: noop,
    title: 'Are you sure you want to delete?',
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false);

    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title={args.title}>
          <p>This action cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => setOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)} variant="danger">
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    );
  },
};
