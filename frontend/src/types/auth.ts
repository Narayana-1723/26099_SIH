import { User } from './user';

export interface LoginCredentials {
  username: string; // employeeId or email
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  employeeId: string;
  email: string;
  password: string;
  cpse?: string;
  cpseId?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
