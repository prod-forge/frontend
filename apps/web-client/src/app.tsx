import type { ReactNode } from 'react';

import { loggerLimit, logsApi, store, traceId } from '@prod-forge-todolist-frontend/core';
import { ErrorBoundary } from '@prod-forge-todolist-frontend/ui-web';
import { logger, LoggerContainer } from 'logrock';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@prod-forge-todolist-frontend/design-tokens/tokens.css';

import './styles.css';
import { AuthHydrationGate } from './containers/auth/auth-hydration-gate';
import { ErrorNotifierContainer } from './containers/errors/error-notifier-container';
import { LayoutContainer } from './containers/layout/layout-container';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { TodoDetail } from './pages/todo-detail/todo-detail';
import { consoleLogger } from './services/console-logger';
import { captureException } from './services/sentry';

export const App = (): ReactNode => {
  return (
    <Provider store={store}>
      <ErrorNotifierContainer />
      <LoggerContainer
        env={import.meta.env.MODE}
        limit={loggerLimit}
        onError={(stack) => {
          // eslint-disable-next-line no-console
          void logsApi.send(stack).catch(console.error);
        }}
        stdout={consoleLogger}
        traceId={traceId}
      >
        <ErrorBoundary
          onError={(error, info) => {
            logger.error(error, 'error-boundary');
            captureException(error, { componentStack: info.componentStack });
          }}
        >
          <AuthHydrationGate>
            <BrowserRouter>
              <Routes>
                <Route element={<LayoutContainer />}>
                  <Route element={<Home />} path="/" />
                  <Route element={<Login />} path="/login" />
                  <Route element={<Register />} path="/register" />
                  <Route element={<TodoDetail />} path="/todo/:id" />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthHydrationGate>
        </ErrorBoundary>
      </LoggerContainer>
    </Provider>
  );
};
