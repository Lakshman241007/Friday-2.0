import { User, UserRole, LoginCredentials } from './auth.types';
import { DEMO_USERS, authApi } from './auth.api';

export interface AuthStoreState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type Listener = () => void;

class AuthStore {
  private state: AuthStoreState = {
    user: DEMO_USERS.manager,
    role: 'manager',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  };

  private listeners = new Set<Listener>();

  constructor() {
    // Attempt to read previous session role preference from sessionStorage if present
    if (typeof window !== 'undefined') {
      try {
        const savedRole = sessionStorage.getItem('friday_demo_role') as UserRole;
        if (savedRole && (savedRole === 'manager' || savedRole === 'employee')) {
          this.state.user = DEMO_USERS[savedRole];
          this.state.role = savedRole;
        }
        const savedAuth = sessionStorage.getItem('friday_demo_auth');
        if (savedAuth === 'false') {
          this.state.user = null;
          this.state.role = null;
          this.state.isAuthenticated = false;
        }
      } catch {
        // Fallback to default
      }
    }
  }

  getState(): AuthStoreState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private setState(partial: Partial<AuthStoreState>): void {
    this.state = { ...this.state, ...partial };
    if (typeof window !== 'undefined') {
      try {
        if (this.state.role) {
          sessionStorage.setItem('friday_demo_role', this.state.role);
        }
        sessionStorage.setItem('friday_demo_auth', String(this.state.isAuthenticated));
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  async login(credentials: LoginCredentials): Promise<void> {
    this.setState({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      this.setState({
        user: response.user,
        role: response.user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      this.setState({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Authentication failed',
      });
      throw err;
    }
  }

  async logout(): Promise<void> {
    this.setState({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      this.setState({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }

  switchRole(role: UserRole): void {
    const newUser = DEMO_USERS[role] || DEMO_USERS.manager;
    this.setState({
      user: newUser,
      role: newUser.role,
      isAuthenticated: true,
      error: null,
    });
  }

  clearError(): void {
    this.setState({ error: null });
  }
}

export const authStore = new AuthStore();
