import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { authReducer } from '../../features/auth/auth.slices';
import { todosReducer } from '../../features/todos/todos.slices';
import { Layout } from './layout';

const meta = {
  component: Layout,
  decorators: [
    (): JSX.Element => {
      const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });

      return (
        <Provider store={store}>
          <MemoryRouter>
            <Routes>
              <Route element={<Layout />}>
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
          </MemoryRouter>
        </Provider>
      );
    },
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
