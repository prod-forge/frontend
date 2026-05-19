import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';

import { CircularProgress } from '../../../components/circular-progress/circular-progress';
import { ErrorBanner } from '../../../components/error-banner/error-banner';

const TIMER_DURATION_MS = 4000;
const TICK_COUNT = 100;
const TICK_MS = TIMER_DURATION_MS / TICK_COUNT;

export interface Props {
  errors?: ErrorItem[];
  onDismiss: (id: string) => void;
}

interface ErrorItem {
  id: string;
  message: string;
}

interface State {
  paused: boolean;
  timer: null | TimerState;
  trackedId: string | undefined;
}

interface TimerState {
  id: string;
  progress: number;
}

const INITIAL_STATE: State = { paused: false, timer: null, trackedId: undefined };

export const ErrorNotifier = ({ errors = [], onDismiss }: Props): ReactNode => {
  const activeError = errors[0];
  const activeErrorId = activeError?.id;

  const [state, setState] = useState<State>(INITIAL_STATE);

  // Derived-state-during-render: reset timer atomically when the active error changes.
  // React re-renders immediately from this setState without committing to the DOM.
  if (state.trackedId !== activeErrorId) {
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setState({
      paused: false,
      timer: activeErrorId ? { id: activeErrorId, progress: 100 } : null,
      trackedId: activeErrorId,
    });
  }

  useEffect(() => {
    if (!state.timer || state.paused) return;

    if (state.timer.progress <= 0) {
      onDismiss(state.timer.id);

      return;
    }

    const timeout = setTimeout(() => {
      setState((prev) =>
        prev.timer ? { ...prev, timer: { ...prev.timer, progress: prev.timer.progress - 1 } } : prev,
      );
    }, TICK_MS);

    return (): void => clearTimeout(timeout);
  }, [state, onDismiss]);

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-4 top-[calc(var(--header-height)+1rem)] z-50 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm"
    >
      {activeError && (
        <div
          onMouseEnter={() => setState((prev) => ({ ...prev, paused: true }))}
          onMouseLeave={() => setState((prev) => ({ ...prev, paused: false }))}
        >
          <ErrorBanner
            message={activeError.message}
            trailing={
              <CircularProgress progress={state.timer?.progress ?? 100} size="sm">
                <button
                  aria-label="Dismiss error"
                  className="flex items-center justify-center leading-none"
                  onClick={() => onDismiss(activeError.id)}
                  type="button"
                >
                  ×
                </button>
              </CircularProgress>
            }
          />
        </div>
      )}
    </div>
  );
};

ErrorNotifier.displayName = 'ErrorNotifier';
