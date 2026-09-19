import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AttentionFeed } from '../AttentionFeed';
import { APP_NAME } from '@/lib/constants';
import { alertsStore } from '../alerts.api';
import { Button } from '@/components/ui/Button';
import { BellRing, ShieldAlert, CheckCheck } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const alerts = alertsStore.getAll();
  const unreadCount = alerts.filter((a) => a.status === 'unread').length;
  const highPriorityCount = alerts.filter((a) => a.priority === 'high' && a.status !== 'dismissed').length;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Conversational Alerts & Attention Feed"
        description="High-priority conversational events, compliance triggers, SLA follow-up breaches, and AI sentiment escalations."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Management' },
          { label: 'Alerts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {unreadCount} Unread
              </span>
            )}
            {highPriorityCount > 0 && (
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {highPriorityCount} Urgent SLA
              </span>
            )}
          </div>
        }
      />

      {/* ATTENTION FEED COMPONENT */}
      <AttentionFeed />
    </div>
  );
};
