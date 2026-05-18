import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { z } from 'zod';

import { EditableDescription } from './editable-description';

const demoSchema = z.string().max(200, 'Description must be 200 characters or fewer');

const meta = {
  component: EditableDescription,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/EditableDescription',
} satisfies Meta<typeof EditableDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = (): void => undefined;

export const Default: Story = {
  args: {
    onSubmit: noop,
    schema: demoSchema,
    value: 'Pick up milk, bread, and eggs on the way home.',
  },
};

export const Empty: Story = {
  args: {
    onSubmit: noop,
    schema: demoSchema,
    value: '',
  },
};

export const Multiline: Story = {
  args: {
    onSubmit: noop,
    schema: demoSchema,
    value: 'First line of the description.\nSecond line with more context.\nThird line for emphasis.',
  },
};

export const Interactive: Story = {
  args: {
    onSubmit: noop,
    schema: demoSchema,
    value: 'Click the pencil to edit. Use Shift+Enter for newlines.',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <EditableDescription maxLength={args.maxLength} onSubmit={setValue} schema={args.schema} value={value} />;
  },
};

export const RequiredAndShort: Story = {
  args: {
    onSubmit: noop,
    schema: z.string().trim().min(1, 'Required').max(40, 'Max 40 characters'),
    value: 'A required, short description',
  },
};
