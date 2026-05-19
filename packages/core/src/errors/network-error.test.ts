import { describe, expect, it } from 'vitest';

import { NETWORK_ERROR_MESSAGES, NetworkError } from './network-error';

describe('NetworkError', () => {
  describe('positive cases', () => {
    it('is an instance of Error', () => {
      expect(new NetworkError()).toBeInstanceOf(Error);
    });

    it('sets name to "NetworkError"', () => {
      expect(new NetworkError().name).toBe('NetworkError');
    });

    it('sets message from NETWORK_ERROR_MESSAGES.CONNECTION_FAILED', () => {
      expect(new NetworkError().message).toBe(NETWORK_ERROR_MESSAGES.CONNECTION_FAILED);
    });
  });
});
