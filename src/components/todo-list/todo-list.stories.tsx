import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import { MemoryRouter } from 'react-router-dom';

import type { Todo } from '../../interfaces/todos';

import { TodoItem } from '../todo-item/todo-item';
import { TodoList } from './todo-list';

const meta = {
  component: TodoList,
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
  title: 'Components/TodoList',
} satisfies Meta<typeof TodoList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTodos: Todo[] = [
  { completed: false, description: 'Define color tokens and typography scale.', id: '1', title: 'Design system setup' },
  { completed: true, description: 'Wire up React Router with layout shell.', id: '2', title: 'Implement routing' },
  { completed: false, description: 'Pick Zustand or React Query.', id: '3', title: 'State management' },
  { completed: false, description: 'Title, description, status fields.', id: '4', title: 'Add / edit todo form' },
  {
    completed: true,
    description: 'Vitest + RTL for hooks and flows.',
    id: '5',
    title: 'Write unit & integration tests',
  },
  { completed: false, description: 'Pre-commit hooks and CI lint job.', id: '6', title: 'Lint & format pipeline' },
];

const noopToggle = (): void => {
  /* noop */
};

export const Default: Story = {
  args: {
    children: sampleTodos.map((todo) => <TodoItem key={todo.id} onToggle={noopToggle} todo={todo} />),
  },
};

export const SingleItem: Story = {
  args: {
    children: <TodoItem onToggle={noopToggle} todo={sampleTodos[0]} />,
  },
};
