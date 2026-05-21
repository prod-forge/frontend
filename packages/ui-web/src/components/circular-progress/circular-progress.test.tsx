import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CircularProgress } from './circular-progress';

describe('CircularProgress', () => {
  describe('negative cases', () => {
    it('clamps progress below 0 and renders "0"', () => {
      render(<CircularProgress progress={-10} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('clamps progress above 100 and renders "100"', () => {
      render(<CircularProgress progress={150} />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('does not render the numeric fallback when children are provided', () => {
      render(
        <CircularProgress progress={75}>
          <span>custom</span>
        </CircularProgress>,
      );

      expect(screen.queryByText('75')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders the rounded progress value as text when no children are provided', () => {
      render(<CircularProgress progress={42.6} />);

      expect(screen.getByText('43')).toBeInTheDocument();
    });

    it('renders children in the center instead of the numeric fallback', () => {
      render(
        <CircularProgress progress={50}>
          <button type="button">×</button>
        </CircularProgress>,
      );

      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    it('hides the SVG from assistive technology', () => {
      const { container } = render(<CircularProgress progress={50} />);

      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden');
    });

    it('uses md (32px) as the default size', () => {
      const { container } = render(<CircularProgress progress={50} />);

      expect(container.firstChild).toHaveStyle({ height: '32px', width: '32px' });
    });

    it('applies sm size (24px) to the wrapper', () => {
      const { container } = render(<CircularProgress progress={50} size="sm" />);

      expect(container.firstChild).toHaveStyle({ height: '24px', width: '24px' });
    });

    it('applies lg size (40px) to the wrapper', () => {
      const { container } = render(<CircularProgress progress={50} size="lg" />);

      expect(container.firstChild).toHaveStyle({ height: '40px', width: '40px' });
    });

    it('sets stroke-dashoffset to 0 on the arc when progress is 100 (full circle)', () => {
      const { container } = render(<CircularProgress progress={100} />);
      const circles = container.querySelectorAll('circle');

      // circles[0] = track, circles[1] = progress arc
      expect(circles[1]?.getAttribute('stroke-dashoffset')).toBe('0');
    });

    it('sets stroke-dashoffset equal to the full circumference when progress is 0 (empty circle)', () => {
      const { container } = render(<CircularProgress progress={0} />);
      const circles = container.querySelectorAll('circle');
      const arc = circles[1];

      const dasharray = Number(arc?.getAttribute('stroke-dasharray'));
      const dashoffset = Number(arc?.getAttribute('stroke-dashoffset'));

      expect(dashoffset).toBeCloseTo(dasharray, 5);
    });
  });
});
