import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { Header } from './header';

const meta = {
  args: {
    onLogout: fn(),
    onToggle: fn(),
  },
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Components/Header',
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    theme: 'light',
  },
};

export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    theme: 'light',
    user: { email: 'anna@example.com', name: 'Anna' },
  },
};
