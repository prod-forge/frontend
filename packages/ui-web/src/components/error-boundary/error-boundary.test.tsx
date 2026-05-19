import type { ErrorInfo } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './error-boundary';

const ThrowingComponent = (): never => {
  throw new Error('Test error');
};

// React always calls console.error when an error boundary catches — silence it in these tests
const suppressConsoleError = (): (() => void) => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {
    return;
  });

  return () => spy.mockRestore();
};

describe('ErrorBoundary', () => {
  describe('negative cases', () => {
    it('renders children normally when no error is thrown', () => {
      render(
        <ErrorBoundary>
          <span>Child content</span>
        </ErrorBoundary>,
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('does not call onError when children render without error', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <span>ok</span>
        </ErrorBoundary>,
      );

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    let restore: () => void;

    beforeEach(() => {
      restore = suppressConsoleError();
    });

    afterEach(() => {
      restore();
    });

    it('renders the fallback UI when a child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    it('hides children and shows only the fallback after an error', () => {
      render(
        <ErrorBoundary>
          <span>Child content</span>
          <ThrowingComponent />
        </ErrorBoundary>,
      );

      expect(screen.queryByText('Child content')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    });

    it('calls onError with the thrown error and component info', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledOnce();
      const [calledError, errorInfo] = onError.mock.calls[0] as [Error, ErrorInfo];
      expect(calledError.message).toBe('Test error');
      expect(typeof errorInfo.componentStack).toBe('string');
    });

    it('calls window.location.reload when the reload button is clicked', async () => {
      const reload = vi.fn();
      vi.stubGlobal('location', { ...window.location, reload });
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      );

      await user.click(screen.getByRole('button', { name: /reload page/i }));

      expect(reload).toHaveBeenCalledOnce();
      vi.unstubAllGlobals();
    });
  });
});
