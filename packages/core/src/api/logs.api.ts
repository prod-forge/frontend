import type { Stack } from 'logrock';

import { apiRequest } from './client';

export const logsApi = {
  send: (stack: Stack): Promise<void> =>
    apiRequest<undefined>('client-logs/web', { body: JSON.stringify(stack), method: 'POST' }),
};
