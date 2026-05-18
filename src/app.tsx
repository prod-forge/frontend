import type { ReactNode } from 'react';

import { logger, LoggerContainer } from 'logrock';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { logsApi } from './api/logs.api';
import { ErrorBoundary } from './components/error-boundary/error-boundary';
import './styles/global.css';
import { Layout } from './components/layout/layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { TodoDetail } from './pages/todo-detail/todo-detail';
import { consoleLogger } from './services/logger/console.logger';
import { loggerLimit } from './services/logger/logger.constants';
import { traceId } from './services/logger/trace-id';
import { captureException } from './services/sentry/sentry';
import { store } from './store';
import { ErrorNotifier } from './widgets/errors/error-notifier/error-notifier';

export const App = (): ReactNode => {
  return (
    <Provider store={store}>
      <ErrorNotifier />
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
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route element={<Home />} path="/" />
                <Route element={<Login />} path="/login" />
                <Route element={<Register />} path="/register" />
                <Route element={<TodoDetail />} path="/todo/:id" />
              </Route>
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </LoggerContainer>
    </Provider>
  );
};
