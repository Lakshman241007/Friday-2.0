import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertPriority, AlertType } from './alerts.types';
import { alertsStore, alertsApi } from './alerts.api';
import { AlertCard } from './AlertCard';
import { AlertDetails } from './AlertDetails';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/common/SearchBar';
import { BellRing, CheckCheck, Filter, ShieldAlert, Sparkles, Clock, AlertCircle } from 'lucide-react';

export interface AttentionFeedProps {
  className?: string;
  isCompact?: boolean;
  onAlertClick?: (alert: Alert) => void;
}

export const AttentionFeed: React.FC<AttentionFeedProps> = ({
  className,
  isCompact = false,
  onAlertClick,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>(() => alertsStore.getAll());
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'overdue' | 'insights'>('all');
  const [search, setSearch] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const unsubscribe = alertsStore.subscribe(() => {
      setAlerts(alertsStore.getAll());
    });
    return unsubscribe;
  }, []);

  const unreadCount = alerts.filter((a) => a.status === 'unread').length;

  const handleDismiss = (id: string) => {
    alertsApi.dismiss(id);
    if (selectedAlert?.id === id) setSelectedAlert(null);
  };

  const handleMarkRead = (id: string) => {
    alertsApi.markRead(id);
  };

  const handleMarkAllRead = () => {
    alertsApi.markAllRead();
  };

  // Filter alerts
  const filtered = alerts.filter((item) => {
    if (activeTab === 'high' && item.priority !== 'high') return false;
    if (activeTab === 'overdue' && item.type !== 'follow_up_overdue') return false;
    if (
      activeTab === 'insights' &&
      !['objection_detected', 'negative_sentiment', 'high_priority_lead'].includes(item.type)
    ) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.leadName && item.leadName.toLowerCase().includes(q)) ||
        (item.company && item.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
            <BellRing className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Attention Feed</h3>
              {unreadCount > 0 && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Conversational anomalies, high-intent triggers, and SLA notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-slate-400 hover:text-white h-8"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              <span>Mark all read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter alerts by lead, company, or trigger..."
          className="max-w-xs w-full"
        />

        <div className="flex items-center gap-1 bg-[#09090d] p-1 rounded-lg border border-white/10 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Alerts', count: alerts.length },
            { id: 'high', label: 'High Priority', count: alerts.filter((a) => a.priority === 'high').length },
            { id: 'overdue', label: 'Overdue SLA', count: alerts.filter((a) => a.type === 'follow_up_overdue').length },
            {
              id: 'insights',
              label: 'AI Insights',
              count: alerts.filter((a) =>
                ['objection_detected', 'negative_sentiment', 'high_priority_lead'].includes(a.type)
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
                activeTab === tab.id
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-[10px] font-mono px-1 rounded',
                  activeTab === tab.id ? 'bg-zinc-800 text-white' : 'bg-white/5 text-slate-500'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed Layout: List & Optional Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className={cn('space-y-2.5', selectedAlert ? 'lg:col-span-7' : 'lg:col-span-12')}>
          {filtered.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-white/[0.08] bg-[#0c0c11]/50 text-slate-400 space-y-2">
              <CheckCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-medium text-slate-300">No active alerts match this filter</div>
              <p className="text-[11px] text-slate-500">
                All high-priority operational items are fulfilled.
              </p>
            </div>
          ) : (
            filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onSelect={(a) => {
                  setSelectedAlert(a);
                  onAlertClick?.(a);
                  if (a.status === 'unread') handleMarkRead(a.id);
                }}
                onDismiss={handleDismiss}
                onMarkRead={handleMarkRead}
              />
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedAlert && (
          <div className="lg:col-span-5">
            <AlertDetails
              alert={selectedAlert}
              onClose={() => setSelectedAlert(null)}
              onDismiss={handleDismiss}
              onMarkRead={handleMarkRead}
            />
          </div>
        )}
      </div>
    </div>
  );
};
