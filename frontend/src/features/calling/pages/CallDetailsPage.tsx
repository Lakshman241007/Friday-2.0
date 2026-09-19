import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CallHistoryItem } from '../calling.types';
import { phase4Store } from '@/features/leads/leads.data';
import { formatPhoneNumber } from '@/features/leads/leads.utils';
import { APP_NAME } from '@/lib/constants';
import {
  ArrowLeft,
  Phone,
  Clock,
  User,
  Building2,
  Calendar,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export interface CallDetailsPageProps {
  callId: string;
}

export const CallDetailsPage: React.FC<CallDetailsPageProps> = ({ callId }) => {
  const [call, setCall] = useState<CallHistoryItem | undefined>(() =>
    phase4Store.getCallById(callId)
  );

  useEffect(() => {
    const update = () => {
      setCall(phase4Store.getCallById(callId));
    };

    const unsubscribe = phase4Store.subscribe(update);
    update();
    return unsubscribe;
  }, [callId]);

  const handleBackToCalling = () => {
    window.location.hash = '/calling';
  };

  const handleGoToLead = () => {
    if (call?.leadId) {
      window.location.hash = `/leads/${call.leadId}`;
    }
  };

  if (!call) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Call Session Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested call session (ID: {callId}) does not exist in active records.
        </p>
        <Button variant="outline" onClick={handleBackToCalling}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calling
        </Button>
      </div>
    );
  }

  const getOutcomeBadge = (outcome: CallHistoryItem['outcome']) => {
    switch (outcome) {
      case 'converted':
        return <Badge variant="success" size="md">Converted to Deal</Badge>;
      case 'interested':
        return <Badge variant="active" size="md">High Interest Verified</Badge>;
      case 'follow_up_required':
        return <Badge variant="warning" size="md">Follow-up Commitment</Badge>;
      case 'no_answer':
        return <Badge variant="neutral" size="md">No Answer / Voicemail</Badge>;
      default:
        return <Badge variant="neutral" size="md">{outcome.replace('_', ' ').toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Nav Controls */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToCalling}
          className="h-8 px-2.5 text-xs text-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Dialer
        </Button>

        {call.leadId && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGoToLead}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            View Lead Dossier
          </Button>
        )}
      </div>

      {/* Page Header */}
      <PageHeader
        title={`Session: ${call.leadName}`}
        description={`Outbound telephonic consultation completed with ${call.company}`}
        badge={getOutcomeBadge(call.outcome)}
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Calling', href: '#/calling' },
          { label: `Session ${call.id}` },
        ]}
      />

      {/* Session Metadata Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-[#0c0c11]/80 border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>Duration</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {call.duration}
          </div>
        </Card>

        <Card className="p-4 bg-[#0c0c11]/80 border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Timestamp</span>
          </div>
          <div className="text-xs font-semibold text-slate-200 truncate">
            {call.date}
          </div>
        </Card>

        <Card className="p-4 bg-[#0c0c11]/80 border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <User className="w-3.5 h-3.5" />
            <span>Agent / Rep</span>
          </div>
          <div className="text-xs font-semibold text-slate-200 truncate">
            {call.employeeName}
          </div>
        </Card>

        <Card className="p-4 bg-[#0c0c11]/80 border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Phone className="w-3.5 h-3.5" />
            <span>Line Type</span>
          </div>
          <div className="text-xs font-semibold text-indigo-300 font-mono">
            Outbound Direct
          </div>
        </Card>
      </div>

      {/* Main Details Card */}
      <Card className="p-6 sm:p-8 bg-[#0c0c11]/80 border border-white/10 space-y-6">
        {/* Contact Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-semibold text-white">
              {call.leadName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{call.company}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{formatPhoneNumber(call.phoneNumber)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Session Verified</span>
          </div>
        </div>

        {/* Outcome & Notes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Session Summary & Logged Remarks</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              {call.notes || 'No custom notes provided for this call session.'}
            </p>
          </div>
        </div>

        {/* Recording & Transcript Direct Link */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Dual-Channel Audio & Verbatim Transcript</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Synchronized audio recording and speaker diarized dialogue available for review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.hash = `/recordings?callId=${call.id}`;
              }}
              className="h-8 text-xs text-slate-300 hover:text-white"
            >
              Recording & Transcript
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.location.hash = `/analysis/${call.id}`;
              }}
              className="h-8 text-xs bg-white text-zinc-950 hover:bg-slate-200"
            >
              AI Analysis & Outcomes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
