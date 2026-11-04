import { hydrateAuth, store } from '@prod-forge-todolist-frontend/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { setupCore } from './services/core-setup';
import { bindSentryUser, initSentry } from './services/sentry';

setupCore();
initSentry();
bindSentryUser(store);
void store.dispatch(hydrateAuth());

const el = document.getElementById('root') as HTMLDivElement;
const root = createRoot(el);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
