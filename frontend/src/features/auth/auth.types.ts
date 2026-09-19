export type UserRole = 'manager' | 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  initials: string;
  status?: 'active' | 'away' | 'busy' | 'offline';
  title?: string;
  department?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: UserRole | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
