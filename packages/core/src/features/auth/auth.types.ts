export type AuthState = {
  token: null | string;
  user: AuthUser | null;
};

export type AuthUser = {
  email: string;
  name?: string;
};
