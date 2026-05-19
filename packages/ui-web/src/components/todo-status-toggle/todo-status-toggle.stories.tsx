import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { TodoStatusToggle } from './todo-status-toggle';

const meta = {
  component: TodoStatusToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/TodoStatusToggle',
} satisfies Meta<typeof TodoStatusToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = {
  args: {
    completed: false,
    onToggle: () => {
      /* noop */
    },
  },
};

export const Done: Story = {
  args: {
    completed: true,
    onToggle: () => {
      /* noop */
    },
  },
};

export const Interactive: Story = {
  args: {
    completed: false,
    onToggle: () => {
      /* noop */
    },
  },
  render: function Render(args) {
    const [completed, setCompleted] = useState(args.completed);

    return <TodoStatusToggle completed={completed} onToggle={() => setCompleted((prev) => !prev)} />;
  },
};
