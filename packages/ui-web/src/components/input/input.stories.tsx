import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './input';

const meta = {
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Input',
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default',
    label: 'Title',
    placeholder: 'What needs to be done?',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Buy groceries',
    id: 'with-value',
    label: 'Title',
  },
};

export const WithError: Story = {
  args: {
    defaultValue: 'a'.repeat(60),
    error: 'Title must be 50 characters or fewer',
    id: 'with-error',
    label: 'Title',
  },
};

export const NoLabel: Story = {
  args: {
    id: 'no-label',
    placeholder: 'Search…',
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 'Cannot change',
    disabled: true,
    id: 'disabled',
    label: 'Title',
  },
};
