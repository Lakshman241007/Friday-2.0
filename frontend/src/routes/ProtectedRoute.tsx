import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/features/auth/pages/Login';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute (Phase 3)
 *
 * Verifies active session token state before rendering protected application routes.
 * Routes to Login if not authenticated.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-xs font-mono text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Verifying cryptographic session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Login />;
  }

  return <>{children}</>;
};
