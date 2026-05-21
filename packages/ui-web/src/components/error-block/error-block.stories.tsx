import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorBlock } from './error-block';

const meta = {
  component: ErrorBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/ErrorBlock',
} satisfies Meta<typeof ErrorBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Failed to load tasks. Please refresh the page.',
  },
};

export const WithAction: Story = {
  args: {
    action: (
      <button
        className="text-sm font-medium text-brand hover:underline"
        onClick={() => {
          return;
        }}
        type="button"
      >
        Retry
      </button>
    ),
    message: 'Failed to load tasks.',
  },
};
