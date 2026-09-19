import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/features/auth/auth.types';
import { hasRequiredRole } from '@/lib/permissions';
import { Unauthorized } from '@/features/auth/pages/Unauthorized';

export interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleRoute (Phase 3)
 *
 * Verifies role authorization before rendering restricted workspace modules.
 * Renders the Unauthorized page if clearance is insufficient.
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { role } = useAuth();
  const isAuthorized = hasRequiredRole(role, allowedRoles);

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Unauthorized requiredRole={allowedRoles.join(' or ')} />;
  }

  return <>{children}</>;
};
