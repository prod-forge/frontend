// The polyfill must run before core is evaluated: core creates its trace id with uuid at import time.
import './services/crypto-polyfill';
import { hydrateAuth, store } from '@prod-forge-todolist-frontend/core';

import { setupCore } from './services/core-setup';
import { initSentry } from './services/sentry';

setupCore();
initSentry();
void store.dispatch(hydrateAuth());
