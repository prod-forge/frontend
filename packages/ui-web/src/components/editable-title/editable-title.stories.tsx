import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { z } from 'zod';

import { EditableTitle } from './editable-title';

const demoSchema = z.string().trim().min(1, 'Title is required').max(50, 'Title must be 50 characters or fewer');

const meta = {
  component: EditableTitle,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/EditableTitle',
} satisfies Meta<typeof EditableTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = (): void => undefined;

export const Default: Story = {
  args: {
    onSubmit: noop,
    schema: demoSchema,
    value: 'Buy groceries',
  },
};

export const LongTitle: Story = {
  args: {
    onSubmit: noop,
    schema: demoSchema,
    value: 'A reasonably long task title that fits within the 50-char limit',
  },
};

export const Interactive: Story = {
  args: {
    onSubmit: noop,
    schema: demoSchema,
    value: 'Edit me — try the pencil button',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <EditableTitle maxLength={args.maxLength} onSubmit={setValue} schema={args.schema} value={value} />;
  },
};

export const CustomShortLimit: Story = {
  args: {
    maxLength: 20,
    onSubmit: noop,
    schema: z.string().trim().min(1, 'Required').max(10, 'Max 10 characters'),
    value: 'Short',
  },
};
