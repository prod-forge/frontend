import type { Meta, StoryObj } from '@storybook/react-vite';

import { useRef, useState } from 'react';

import { AddTodoForm } from './add-todo-form';

const meta = {
  component: AddTodoForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Widgets/AddTodoForm',
} satisfies Meta<typeof AddTodoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = (): void => undefined;

export const Default: Story = {
  args: {
    onSubmit: noop,
  },
};

export const Interactive: Story = {
  args: {
    onSubmit: noop,
  },
  render: function Render() {
    const idRef = useRef(0);
    const [submissions, setSubmissions] = useState<{ description: string; id: number; title: string }[]>([]);

    return (
      <div className="flex flex-col gap-6">
        <AddTodoForm
          onSubmit={(values) => {
            idRef.current += 1;
            setSubmissions((prev) => [{ ...values, id: idRef.current }, ...prev]);
          }}
        />
        {submissions.length > 0 && (
          <div className="rounded-md border border-line bg-page-soft p-4">
            <h3 className="mb-2 text-sm font-semibold text-fg">Submissions</h3>
            <ul className="flex flex-col gap-2 text-sm text-fg-soft">
              {submissions.map((s) => (
                <li key={s.id}>
                  <strong>{s.title}</strong>
                  {s.description ? <span>: {s.description}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};
