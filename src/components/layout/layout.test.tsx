import type { RenderResult } from '@testing-library/react';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { authReducer } from '../../features/auth/auth.slices';
import { todosReducer } from '../../features/todos/todos.slices';
import { Layout } from './layout';

const renderLayout = (): RenderResult => {
  const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />} path="/">
            <Route element={<div data-testid="page-content">Hello page</div>} index />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('Layout', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('renders the header and the routed page', () => {
    renderLayout();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toHaveTextContent('Hello page');
  });

  it('toggles the theme when the header button is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const initialLabel = screen
      .getByRole('button', { name: /switch to (dark|light) mode/i })
      .getAttribute('aria-label');

    await user.click(screen.getByRole('button', { name: /switch to (dark|light) mode/i }));

    const nextLabel = screen.getByRole('button', { name: /switch to (dark|light) mode/i }).getAttribute('aria-label');
    expect(nextLabel).not.toBe(initialLabel);
  });
});
