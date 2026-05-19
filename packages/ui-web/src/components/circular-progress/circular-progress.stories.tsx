import type { Meta, StoryObj } from '@storybook/react-vite';

import { CircularProgress } from './circular-progress';

const meta = {
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/CircularProgress',
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    progress: 75,
  },
};

export const WithChildren: Story = {
  args: {
    children: (
      <button aria-label="Dismiss" type="button">
        ×
      </button>
    ),
    progress: 60,
  },
};

export const Empty: Story = {
  args: {
    progress: 0,
  },
};

export const Full: Story = {
  args: {
    progress: 100,
  },
};

export const Sm: Story = {
  args: {
    progress: 50,
    size: 'sm',
  },
};

export const Md: Story = {
  args: {
    progress: 50,
    size: 'md',
  },
};

export const Lg: Story = {
  args: {
    progress: 50,
    size: 'lg',
  },
};
