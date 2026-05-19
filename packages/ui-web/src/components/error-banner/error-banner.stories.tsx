import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorBanner } from './error-banner';

const meta = {
  component: ErrorBanner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/ErrorBanner',
} satisfies Meta<typeof ErrorBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Something went wrong. Please try again.',
  },
};

export const LongMessage: Story = {
  args: {
    message:
      'An unexpected error occurred while processing your request. Please check your connection and try again later.',
  },
};

export const WithTrailing: Story = {
  args: {
    message: 'Something went wrong.',
    trailing: (
      <button
        className="font-semibold hover:underline"
        onClick={() => {
          return;
        }}
        type="button"
      >
        ×
      </button>
    ),
  },
};
