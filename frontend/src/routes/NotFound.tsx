import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { APP_NAME } from '@/lib/constants';
import { Compass, ArrowLeft, LayoutDashboard, Users } from 'lucide-react';

export interface NotFoundProps {
  attemptedPath?: string;
  onNavigateHome?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ attemptedPath, onNavigateHome }) => {
  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/dashboard';
    }
  };

  const handleGoToLeads = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#/leads';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <PageHeader
        title="404 — Partition Disconnected"
        description="The requested routing coordinates do not match any known workspace partition or active session."
        badge={
          <Badge variant="error" size="sm" dot>
            Signal Terminated
          </Badge>
        }
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'System' },
          { label: '404 Disconnected' },
        ]}
      />

      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shadow-xs">
          <Compass className="w-6 h-6 text-slate-400 animate-spin" style={{ animationDuration: '16s' }} />
        </div>

        <div className="space-y-1.5">
          <div className="font-mono text-xs uppercase tracking-widest text-slate-500 font-semibold">
            {APP_NAME} Router
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Transmission Coordinates Unknown
          </h2>
          {attemptedPath && (
            <p className="font-mono text-xs text-rose-400/90 pt-1">
              Path: {attemptedPath}
            </p>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
          The requested record, session, or analytical view could not be located in active telemetry memory.
          Please verify your URL parameters or return to an established module.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleGoHome}
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
            className="bg-white text-zinc-950 hover:bg-slate-200"
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToLeads}
            leftIcon={<Users className="w-4 h-4" />}
            className="text-slate-300 hover:text-white"
          >
            Browse Active Leads
          </Button>
        </div>
      </div>
    </div>
  );
};
