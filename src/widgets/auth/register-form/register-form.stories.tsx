import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { RegisterForm } from './register-form';

const meta = {
  args: {
    onSubmit: fn(),
  },
  component: RegisterForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Widgets/RegisterForm',
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
