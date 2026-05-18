import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { initSentry } from './services/sentry/sentry';

initSentry();

const el = document.getElementById('root') as HTMLDivElement;
const root = createRoot(el);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
