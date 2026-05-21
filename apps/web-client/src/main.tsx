import { initSentry } from '@prod-forge-todolist-frontend/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';

initSentry();

const el = document.getElementById('root') as HTMLDivElement;
const root = createRoot(el);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
