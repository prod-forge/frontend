import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Layout } from './layout';

const renderLayout = (props?: React.ComponentProps<typeof Layout>): RenderResult =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout {...props} />} path="/">
          <Route element={<div data-testid="page-content">Hello page</div>} index />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Layout', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  describe('negative cases', () => {
    it('renders without user info when not authenticated', () => {
      renderLayout();

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.queryByTestId('header-user')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders the header and the routed page', () => {
      renderLayout();

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toHaveTextContent('Hello page');
    });

    it('renders user info when authenticated', () => {
      renderLayout({ isAuthenticated: true, user: { email: 'user@example.com', name: 'John' } });

      expect(screen.getByTestId('header-user')).toBeInTheDocument();
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
});
