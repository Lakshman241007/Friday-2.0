import React from 'react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/lib/constants';
import { ShieldAlert, ArrowLeft, RefreshCw, LogIn } from 'lucide-react';

export interface UnauthorizedProps {
  requiredRole?: string;
  onReturn?: () => void;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({
  requiredRole,
  onReturn,
}) => {
  const { role, user, switchRole, isAuthenticated } = useAuth();

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/dashboard';
    }
  };

  const handleSwitchToManager = () => {
    switchRole('manager');
    if (typeof window !== 'undefined') {
      window.location.hash = '#/dashboard';
    }
  };

  const handleGoToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#/login';
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <GalaxyBackground enableShootingStars={false} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        {/* Shield Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-xl shadow-amber-500/5">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title and Context */}
        <div className="space-y-2 mb-6">
          <Badge variant="warning" size="sm" dot className="mb-2">
            Access Boundary Clearance
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Restricted Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your current security profile does not have clearance to view this workspace partition.
          </p>
        </div>

        {/* Diagnostic Metadata Panel */}
        <div className="w-full rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-md p-4 mb-6 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
            <span className="text-slate-500">Active Profile:</span>
            <span className="text-slate-200 font-mono font-medium">
              {user?.name ?? 'Unauthenticated'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
            <span className="text-slate-500">Current Role:</span>
            <Badge variant="neutral" size="sm" className="font-mono">
              {role ?? 'none'}
            </Badge>
          </div>
          {requiredRole && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Required Role:</span>
              <span className="text-amber-300 font-mono font-medium">
                {requiredRole}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full space-y-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={handleReturn}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full justify-center"
          >
            Return to Dashboard
          </Button>

          {role === 'employee' && (
            <Button
              variant="outline"
              size="md"
              onClick={handleSwitchToManager}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="w-full justify-center"
            >
              Switch Role to Manager (Demo)
            </Button>
          )}

          {!isAuthenticated && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleGoToLogin}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full justify-center"
            >
              Sign In to Console
            </Button>
          )}
        </div>

        <p className="mt-8 text-[11px] font-mono text-slate-500">
          {APP_NAME} Sentinel Access Control
        </p>
      </div>
    </div>
  );
};
