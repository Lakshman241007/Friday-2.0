import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/common/SearchBar';
import { Modal } from '@/components/ui/Modal';
import { FollowUpTable } from '../components/FollowUpTable';
import { FollowUpCard } from '../components/FollowUpCard';
import { FollowUpForm } from '../components/FollowUpForm';
import { FollowUpTimeline } from '../components/FollowUpTimeline';
import { PriorityBadge } from '../components/PriorityBadge';
import { FollowUp, FollowUpFormData } from '../followups.types';
import { followupsApi, followUpsStore } from '../followups.api';
import { authStore } from '@/features/auth/auth.store';
import { APP_NAME } from '@/lib/constants';
import {
  CalendarClock,
  Plus,
  LayoutGrid,
  List,
  AlertCircle,
  Clock,
  CheckCircle2,
  Building2,
  User,
  PhoneCall,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => followUpsStore.getAll());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FollowUp | null>(null);
  const [inspectedItem, setInspectedItem] = useState<FollowUp | null>(null);

  const auth = authStore.getState();
  const isManager = auth.role === 'manager' || auth.role === 'admin';

  useEffect(() => {
    const unsubscribe = followUpsStore.subscribe(() => {
      setFollowUps(followUpsStore.getAll());
    });
    return unsubscribe;
  }, []);

  // Compute summary counters
  const dueTodayCount = followUps.filter((f) => f.status === 'Due Today').length;
  const overdueCount = followUps.filter((f) => f.status === 'Overdue').length;
  const highPriorityCount = followUps.filter((f) => f.priority === 'High' && f.status !== 'Completed').length;
  const completedCount = followUps.filter((f) => f.status === 'Completed').length;

  // Filter items
  const filtered = followUps.filter((item) => {
    if (statusFilter !== 'all' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (priorityFilter !== 'all' && item.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.leadName.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.employeeName.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreate = (data: FollowUpFormData) => {
    if (editingItem) {
      followupsApi.updateFollowUp(editingItem.id, data);
      setEditingItem(null);
    } else {
      followupsApi.createFollowUp(data);
    }
  };

  const handleComplete = (id: string) => {
    followupsApi.completeFollowUp(id);
  };

  const handleNavigateToCall = (callId: string) => {
    window.location.hash = `/calling/${callId}`;
  };

  const handleNavigateToAnalysis = (callId: string) => {
    window.location.hash = `/analysis/${callId}`;
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Operational Follow-ups"
        description="Active customer commitments, scheduled callbacks, and post-call task fulfillment."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Management' },
          { label: 'Follow-ups' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setIsCreateOpen(true);
              }}
              className="h-8 text-xs bg-white text-zinc-950 hover:bg-slate-200"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Schedule Follow-up</span>
            </Button>
          </div>
        }
      />

      {/* SUMMARY OPERATIONAL CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Due Today */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'due today' ? 'all' : 'due today')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'due today'
              ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
              : 'bg-[#0c0c11]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Due Today</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {dueTodayCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Require representative outreach before end of day
          </div>
        </div>

        {/* Metric 2: Overdue */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'overdue'
              ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30'
              : 'bg-[#0c0c11]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Overdue Tasks</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
            {overdueCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            SLA breached commitments requiring escalation
          </div>
        </div>

        {/* Metric 3: High Priority */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'high'
              ? 'bg-indigo-500/10 border-indigo-500/40 ring-1 ring-indigo-500/30'
              : 'bg-[#0c0c11]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>High Priority</span>
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
            {highPriorityCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            High-intent accounts and executive pilots
          </div>
        </div>

        {/* Metric 4: Completed */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
              : 'bg-[#0c0c11]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            {completedCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Successfully closed or transitioned commitments
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by prospect, company, owner, or agenda notes..."
          className="max-w-md w-full"
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#09090d] p-1 rounded-lg border border-white/10 text-xs">
            {['all', 'due today', 'overdue', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Priority Dropdown Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#09090d] border border-white/10 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-[#09090d] p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: TABLE OR CARDS */}
      {viewMode === 'table' ? (
        <FollowUpTable
          followUps={filtered}
          onView={(item) => setInspectedItem(item)}
          onEdit={(item) => {
            setEditingItem(item);
            setIsCreateOpen(true);
          }}
          onComplete={handleComplete}
          onNavigateToCall={handleNavigateToCall}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <FollowUpCard
              key={item.id}
              followUp={item}
              onView={(f) => setInspectedItem(f)}
              onEdit={(f) => {
                setEditingItem(f);
                setIsCreateOpen(true);
              }}
              onComplete={handleComplete}
              onNavigateToCall={handleNavigateToCall}
            />
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <FollowUpForm
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreate}
        initialData={editingItem}
      />

      {/* DETAIL & TIMELINE INSPECTION MODAL */}
      {inspectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedItem(null)}
          title={`Follow-up Commitment: ${inspectedItem.leadName}`}
          size="lg"
        >
          <div className="space-y-5 pt-2">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-white text-sm sm:text-base">
                  {inspectedItem.leadName}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>{inspectedItem.company}</span>
                  <span>•</span>
                  <span>{inspectedItem.contactEmail}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={inspectedItem.priority} />
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  {inspectedItem.type}
                </span>
              </div>
            </div>

            {/* Agenda & Notes */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Objective & Recorded Context
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                {inspectedItem.notes}
              </p>
            </div>

            {/* Previous Call & AI Disposition Context */}
            {inspectedItem.callId && (
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <div className="text-slate-400 font-mono text-[11px]">
                    Origin Call: #{inspectedItem.callId} ({inspectedItem.previousCallDate})
                  </div>
                  <div className="text-slate-200 font-medium">
                    AI Classified Disposition: <span className="text-emerald-300">{inspectedItem.callOutcome || 'Follow-up Required'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateToCall(inspectedItem.callId!)}
                    className="h-7 text-xs text-slate-300 hover:text-white"
                  >
                    <PhoneCall className="w-3 h-3 mr-1" />
                    <span>Call Details</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateToAnalysis(inspectedItem.callId!)}
                    className="h-7 text-xs text-slate-300 hover:text-white"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    <span>AI Analysis</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Full Lifecycle Evolution Timeline */}
            <FollowUpTimeline
              events={inspectedItem.timeline}
              callId={inspectedItem.callId}
              onCallClick={(id) => handleNavigateToCall(id)}
            />

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] font-mono text-slate-500">
                Scheduled for {inspectedItem.dueDate} at {inspectedItem.dueTime}
              </span>

              <div className="flex items-center gap-2">
                {inspectedItem.status !== 'Completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleComplete(inspectedItem.id);
                      setInspectedItem({ ...inspectedItem, status: 'Completed' });
                    }}
                    className="text-xs text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Mark Completed
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspectedItem(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
