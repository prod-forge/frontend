import type { Meta, StoryObj } from '@storybook/react-vite';

import { TodoStatus } from './todo-status';

const meta = {
  component: TodoStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/TodoStatus',
} satisfies Meta<typeof TodoStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = {
  args: {
    completed: false,
  },
};

export const Done: Story = {
  args: {
    completed: true,
  },
};
