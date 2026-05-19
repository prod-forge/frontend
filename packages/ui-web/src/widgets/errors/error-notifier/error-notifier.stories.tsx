import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorNotifier } from './error-notifier';

const meta = {
  component: ErrorNotifier,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Widgets/Errors/ErrorNotifier',
} satisfies Meta<typeof ErrorNotifier>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = (): void => undefined;

export const Default: Story = {
  args: {
    errors: [],
    onDismiss: noop,
  },
};

export const WithError: Story = {
  args: {
    errors: [{ id: '1', message: 'Something went wrong. Please try again.' }],
    onDismiss: noop,
  },
};

export const MultipleErrors: Story = {
  args: {
    errors: [
      { id: '1', message: 'First error message.' },
      { id: '2', message: 'Second error message (queued).' },
    ],
    onDismiss: noop,
  },
};
