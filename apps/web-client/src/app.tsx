import type { ReactNode } from 'react';

import { loggerLimit, logsApi, store, traceId } from '@prod-forge-todolist-frontend/core';
import { ErrorBoundary, Preloader } from '@prod-forge-todolist-frontend/ui-web';
import { logger, LoggerContainer } from 'logrock';
import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import '@prod-forge-todolist-frontend/design-tokens/tokens.css';

import './styles.css';
import { AuthHydrationGate } from './containers/auth/auth-hydration-gate';
import { ErrorNotifierContainer } from './containers/errors/error-notifier-container';
import { LayoutContainer } from './containers/layout/layout-container';
import { consoleLogger } from './services/console-logger';
import { captureException } from './services/sentry';

// One chunk per route: the first paint only downloads the page the user opened.
const Home = lazy(() => import('./pages/home/home').then((module) => ({ default: module.Home })));
const Login = lazy(() => import('./pages/login/login').then((module) => ({ default: module.Login })));
const NotFound = lazy(() => import('./pages/not-found/not-found').then((module) => ({ default: module.NotFound })));
const Register = lazy(() => import('./pages/register/register').then((module) => ({ default: module.Register })));
const TodoDetail = lazy(() =>
  import('./pages/todo-detail/todo-detail').then((module) => ({ default: module.TodoDetail })),
);

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
                  <Route
                    element={
                      <Suspense fallback={<Preloader />}>
                        <Outlet />
                      </Suspense>
                    }
                  >
                    <Route element={<Home />} path="/" />
                    <Route element={<Login />} path="/login" />
                    <Route element={<Register />} path="/register" />
                    <Route element={<TodoDetail />} path="/todo/:id" />
                    <Route element={<NotFound />} path="*" />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthHydrationGate>
        </ErrorBoundary>
      </LoggerContainer>
    </Provider>
  );
};
