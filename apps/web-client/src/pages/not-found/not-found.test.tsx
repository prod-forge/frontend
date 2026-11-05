import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { NotFound } from './not-found';

const renderNotFound = (): void => {
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>,
  );
};

describe('<NotFound /> page', () => {
  describe('negative cases', () => {
    it('does not render a todo list', () => {
      renderNotFound();

      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('tells the user that the page does not exist', () => {
      renderNotFound();

      expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
    });

    it('links back to the home page', () => {
      renderNotFound();

      expect(screen.getByRole('link', { name: /go back to home/i })).toHaveAttribute('href', '/');
    });
  });
});
