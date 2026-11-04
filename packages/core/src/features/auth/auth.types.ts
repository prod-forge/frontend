export type AuthState = {
  hydration: 'done' | 'hydrating' | 'idle';
  token: null | string;
  user: AuthUser | null;
};

export type AuthUser = {
  email: string;
  name?: string;
};
