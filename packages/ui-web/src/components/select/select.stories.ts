import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select } from './select';

const meta = {
  component: Select,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Select',
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = (): void => undefined;

export const SortBy: Story = {
  args: {
    id: 'sort-by',
    label: 'Sort by',
    onChange: noop,
    options: [
      { label: 'Title', value: 'title' },
      { label: 'Status', value: 'completed' },
    ],
    value: 'title',
  },
};

export const Order: Story = {
  args: {
    id: 'order',
    label: 'Order',
    onChange: noop,
    options: [
      { label: 'Ascending', value: 'asc' },
      { label: 'Descending', value: 'desc' },
    ],
    value: 'asc',
  },
};

export const NoLabel: Story = {
  args: {
    'aria-label': 'Choose option',
    id: 'no-label',
    onChange: noop,
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
    ],
    value: 'a',
  },
};
