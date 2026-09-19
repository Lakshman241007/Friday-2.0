import { useSyncExternalStore, useCallback } from 'react';
import { authStore, AuthStoreState } from '@/features/auth/auth.store';
import { LoginCredentials, UserRole } from '@/features/auth/auth.types';

export interface UseAuthReturn extends AuthStoreState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const state = useSyncExternalStore(
    (callback) => authStore.subscribe(callback),
    () => authStore.getState(),
    () => authStore.getState()
  );

  const login = useCallback(async (credentials: LoginCredentials) => {
    await authStore.login(credentials);
  }, []);

  const logout = useCallback(async () => {
    await authStore.logout();
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    authStore.switchRole(role);
  }, []);

  const clearError = useCallback(() => {
    authStore.clearError();
  }, []);

  return {
    ...state,
    login,
    logout,
    switchRole,
    clearError,
  };
}
