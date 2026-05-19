export interface AuthState {
  token: null | string;
  user: AuthUser | null;
}

export interface AuthUser {
  email: string;
  name?: string;
}
