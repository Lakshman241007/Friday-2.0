import { UserRole } from './constants';

export type PermissionAction =
  | 'view_dashboard'
  | 'manage_leads'
  | 'assign_leads'
  | 'initiate_calls'
  | 'view_recordings'
  | 'view_transcripts'
  | 'view_analysis'
  | 'view_outcomes'
  | 'manage_followups'
  | 'view_alerts'
  | 'view_performance'
  | 'manage_coaching'
  | 'view_reports'
  | 'manage_settings';

export interface RolePermissions {
  role: UserRole;
  actions: PermissionAction[];
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: [
    'view_dashboard',
    'manage_leads',
    'assign_leads',
    'initiate_calls',
    'view_recordings',
    'view_transcripts',
    'view_analysis',
    'view_outcomes',
    'manage_followups',
    'view_alerts',
    'view_performance',
    'manage_coaching',
    'view_reports',
    'manage_settings',
  ],
  manager: [
    'view_dashboard',
    'manage_leads',
    'assign_leads',
    'initiate_calls',
    'view_recordings',
    'view_transcripts',
    'view_analysis',
    'view_outcomes',
    'manage_followups',
    'view_alerts',
    'view_performance',
    'manage_coaching',
    'view_reports',
  ],
  employee: [
    'view_dashboard',
    'manage_leads',
    'initiate_calls',
    'view_recordings',
    'view_transcripts',
    'view_analysis',
    'view_outcomes',
    'manage_followups',
    'view_alerts',
    'view_performance',
  ],
};

/**
 * Checks if a user role possesses the required role permission.
 */
export function hasRequiredRole(
  userRole?: UserRole | null,
  allowedRoles?: UserRole[]
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (!userRole) {
    return false;
  }
  return allowedRoles.includes(userRole);
}

/**
 * Checks if a user role is permitted to perform a specified action.
 */
export function canPerformAction(
  userRole: UserRole | undefined,
  action: PermissionAction
): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(action);
}
