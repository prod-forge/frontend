import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmptyState } from './empty-state';

const meta = {
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/EmptyState',
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'No tasks match your search.',
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Nothing here yet.',
  },
};
