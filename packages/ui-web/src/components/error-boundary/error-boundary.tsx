import type { ErrorInfo, ReactNode } from 'react';

import { Component } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  static displayName = 'ErrorBoundary';

  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="mx-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-fg">Something went wrong</h1>
          <p className="text-lg text-fg-soft">An unexpected error occurred. Try reloading the page.</p>
          <button
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-brand-fg transition duration-[120ms] hover:bg-brand-hover focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload page
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
