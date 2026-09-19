import { User, LoginCredentials, AuthResponse, UserRole } from './auth.types';

export const DEMO_USERS: Record<UserRole, User> = {
  manager: {
    id: 'usr_mgr_01',
    name: 'Lakshman M.',
    email: 'lakshmanmukesh7@gmail.com',
    role: 'manager',
    initials: 'LM',
    title: 'Operations & Revenue Lead',
    department: 'Sales Intelligence',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
  },
  employee: {
    id: 'usr_emp_01',
    name: 'Elena Rostova',
    email: 'elena.rostova@friday.ai',
    role: 'employee',
    initials: 'ER',
    title: 'Senior Account Executive',
    department: 'Outbound Velocity',
    status: 'active',
    createdAt: '2026-02-01T09:30:00Z',
  },
  admin: {
    id: 'usr_adm_01',
    name: 'FRIDAY Overseer',
    email: 'admin@friday.ai',
    role: 'admin',
    initials: 'AD',
    title: 'System Administrator',
    department: 'Core Platform',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
};

/**
 * Authentication API Foundation (Phase 3)
 *
 * Simulates local async network contract without initiating backend HTTP requests.
 * Prepared for clean replacement with backend endpoints in Phase 8.
 */
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulated micro-delay for realistic UI feedback
    await new Promise((resolve) => setTimeout(resolve, 350));

    const selectedRole = credentials.role || (credentials.email.includes('elena') ? 'employee' : 'manager');
    const user = DEMO_USERS[selectedRole] || DEMO_USERS.manager;

    return {
      user: {
        ...user,
        email: credentials.email || user.email,
      },
      token: `demo_jwt_token_${selectedRole}_${Date.now()}`,
      expiresIn: 86400,
    };
  },

  async logout(): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { success: true };
  },

  async getCurrentUser(role: UserRole = 'manager'): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return DEMO_USERS[role] || DEMO_USERS.manager;
  },
};
