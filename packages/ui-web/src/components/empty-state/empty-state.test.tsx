import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  describe('negative cases', () => {
    it('does not render when message is an empty string', () => {
      const { container } = render(<EmptyState message="" />);

      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe('positive cases', () => {
    it('renders the provided message', () => {
      render(<EmptyState message="No tasks match your search." />);

      expect(screen.getByText('No tasks match your search.')).toBeInTheDocument();
    });

    it('renders a different message when passed', () => {
      render(<EmptyState message="Nothing here yet." />);

      expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
    });
  });
});
