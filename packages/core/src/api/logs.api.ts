import { apiRequest } from './client';

export const logsApi = {
  send: (stack: object): Promise<void> =>
    apiRequest<undefined>('client-logs/web', { body: JSON.stringify(stack), method: 'POST' }),
};
