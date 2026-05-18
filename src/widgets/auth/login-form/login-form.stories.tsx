import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { LoginForm } from './login-form';

const meta = {
  args: {
    onForgotPassword: fn(),
    onSubmit: fn(),
  },
  component: LoginForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Widgets/LoginForm',
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
