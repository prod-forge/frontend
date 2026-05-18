import type { Meta, StoryObj } from '@storybook/react-vite';

import { RetryButton } from './retry-button';

const meta = {
  component: RetryButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/RetryButton',
} satisfies Meta<typeof RetryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => {
      return;
    },
  },
};
