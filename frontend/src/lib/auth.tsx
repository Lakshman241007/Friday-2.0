import React from 'react';
import { useAuth as useAuthHook, UseAuthReturn } from '@/hooks/useAuth';
import { UserRole, User } from '@/features/auth/auth.types';

export type UserProfile = User;
export type AuthContextType = UseAuthReturn;

export interface AuthProviderProps {
  children: React.ReactNode;
  initialRole?: UserRole;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = useAuthHook;
