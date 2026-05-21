export const NETWORK_ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Unable to connect to the server. Please check your connection.',
} as const;

export class NetworkError extends Error {
  constructor() {
    super(NETWORK_ERROR_MESSAGES.CONNECTION_FAILED);
    this.name = 'NetworkError';
  }
}
