import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import { MemoryRouter } from 'react-router-dom';

import { TodoItem } from './todo-item';

const meta = {
  args: {
    onToggle: (): void => {
      /* noop */
    },
  },
  component: TodoItem,
  decorators: [
    (Story): JSX.Element => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/TodoItem',
} satisfies Meta<typeof TodoItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = {
  args: {
    todo: {
      completed: false,
      description: 'Set up CSS custom properties for the entire project.',
      id: '1',
      title: 'Design system setup',
    },
  },
};

export const Done: Story = {
  args: {
    todo: {
      completed: true,
      description: 'Evaluated and integrated Zustand for state management.',
      id: '3',
      title: 'State management complete',
    },
  },
};

export const LongTitle: Story = {
  args: {
    todo: {
      completed: false,
      description: 'Testing truncation behavior for long titles.',
      id: '4',
      title: 'This is a very long todo title that should be truncated with an ellipsis when it overflows',
    },
  },
};
