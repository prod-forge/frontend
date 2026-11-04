import { apiRequest } from './client';

export type AccessToken = {
  readonly accessToken: string;
  /** Token lifetime in seconds (backend JWT_TTL). */
  readonly expiresIn: number;
};

export const authApi = {
  login: (email: string): Promise<AccessToken> =>
    apiRequest<{ data: AccessToken }>('auth/login', { body: JSON.stringify({ email }), method: 'POST' }).then(
      (r) => r.data,
    ),
};
