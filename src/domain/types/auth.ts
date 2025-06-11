import { User } from '@domain/entities/User';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  expiresAt: string | null; // ISO string
  loading: boolean;
}
