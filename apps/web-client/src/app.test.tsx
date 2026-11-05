import { hydrateAuth, store } from '@prod-forge-todolist-frontend/core';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './app';

// React.lazy caches a resolved chunk for the whole test file, so each case opens a route no other case loads.
const renderAt = (path: string): void => {
  window.history.pushState({}, '', path);
  render(<App />);
};

beforeEach(async () => {
  await store.dispatch(hydrateAuth());
});

describe('<App /> route code splitting', () => {
  describe('negative cases', () => {
    it('does not render the login page before its lazy route chunk resolves', async () => {
      renderAt('/login');

      expect(screen.queryByRole('form', { name: /login form/i })).not.toBeInTheDocument();
      expect(await screen.findByRole('form', { name: /login form/i })).toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders the not found page for an unknown path', async () => {
      renderAt('/no-such-page');

      expect(await screen.findByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
    });

    it('renders the Preloader at /todo/1 until the lazy route chunk resolves', async () => {
      renderAt('/todo/1');

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();

      // A guest is redirected from the detail page to the welcome page once the chunks resolve.
      await screen.findByRole('heading', { level: 1, name: /welcome to todoai/i });

      expect(screen.queryByRole('status', { name: /loading/i })).not.toBeInTheDocument();
      expect(window.location.pathname).toBe('/');
    });
  });
});
