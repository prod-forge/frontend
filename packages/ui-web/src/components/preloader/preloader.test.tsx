import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Preloader } from './preloader';

describe('Preloader', () => {
  describe('positive cases', () => {
    it('renders a status role element with "Loading" label', () => {
      render(<Preloader />);

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    });

    it('renders the spinner svg', () => {
      render(<Preloader />);

      const status = screen.getByRole('status');
      expect(status.querySelector('svg')).toBeInTheDocument();
    });
  });
});
