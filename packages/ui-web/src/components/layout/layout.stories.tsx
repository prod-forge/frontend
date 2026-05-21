import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import { Route, Routes } from 'react-router-dom';

import { Layout } from './layout';

const meta = {
  component: Layout,
  decorators: [
    (_Story, { args }): JSX.Element => (
      <Routes>
        <Route element={<Layout {...args} />}>
          <Route
            element={
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
                Page content renders here via <code>&lt;Outlet /&gt;</code>
              </div>
            }
            path="/"
          />
        </Route>
      </Routes>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Components/Layout',
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    onLogout: () => undefined,
    user: { email: 'user@example.com', name: 'John Doe' },
  },
};
