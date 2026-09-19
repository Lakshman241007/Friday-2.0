import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialer } from '../components/Dialer';
import { CallTimer } from '../components/CallTimer';
import { CallStatus } from '../components/CallStatus';
import { RecordingIndicator, RecordingStatus } from '../components/RecordingIndicator';
import { CallControls } from '../components/CallControls';
import { CallHistory } from '../components/CallHistory';
import { LeadStatusBadge } from '@/features/leads/components/LeadStatusBadge';
import { LeadScore } from '@/features/leads/components/LeadScore';
import { CallStatus as CallStatusType, CallOutcome, CallHistoryItem } from '../calling.types';
import { Lead } from '@/features/leads/leads.types';
import { phase4Store } from '@/features/leads/leads.data';
import { formatPhoneNumber } from '@/features/leads/leads.utils';
import { APP_NAME } from '@/lib/constants';
import {
  PhoneCall,
  User,
  Building2,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const DialerPage: React.FC = () => {
  // Read query params from URL hash (e.g. #/calling?leadId=lead-101)
  const getUrlLeadId = () => {
    const hash = window.location.hash;
    const match = hash.match(/leadId=([^&]+)/);
    return match ? match[1] : null;
  };

  const [leads, setLeads] = useState<Lead[]>(() => phase4Store.getLeads());
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(getUrlLeadId() || (leads[0]?.id ?? null));
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatusType>('ready');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome>('interested');
  const [callNotes, setCallNotes] = useState('');
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(() => phase4Store.getCallHistory());
  const [lastLoggedCallId, setLastLoggedCallId] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize with store
  useEffect(() => {
    const unsubscribe = phase4Store.subscribe(() => {
      setLeads(phase4Store.getLeads());
      setCallHistory(phase4Store.getCallHistory());
    });
    return unsubscribe;
  }, []);

  // Sync phone number when selected lead changes
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  useEffect(() => {
    if (selectedLead && callStatus === 'ready') {
      setPhoneNumber(selectedLead.phone);
    }
  }, [selectedLead, callStatus]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Call lifecycle simulation
  const handleStartCall = () => {
    if (!phoneNumber) return;

    setCallStatus('dialing');
    setCallDurationSeconds(0);
    setIsMuted(false);
    setIsOnHold(false);
    setLastLoggedCallId(null);

    // After 1.8s dialing -> switch to ringing
    timerRef.current = setTimeout(() => {
      setCallStatus('ringing');

      // After 2.0s ringing -> connected
      timerRef.current = setTimeout(() => {
        setCallStatus('connected');
      }, 2000);
    }, 1800);
  };

  const handleEndCall = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCallStatus('completed');
  };

  const handleCallAgain = () => {
    setCallStatus('ready');
    setCallDurationSeconds(0);
    setIsMuted(false);
    setIsOnHold(false);
    setCallNotes('');
  };

  const handleSaveOutcome = () => {
    const formatDur = (s: number) => {
      const mins = String(Math.floor(s / 60)).padStart(2, '0');
      const secs = String(s % 60).padStart(2, '0');
      return `${mins}:${secs}`;
    };

    const record = phase4Store.addCallRecord({
      leadId: selectedLead?.id || 'lead-manual',
      leadName: selectedLead?.name || 'Direct Contact',
      company: selectedLead?.company || 'General Outreach',
      employeeName: selectedLead?.assignedEmployeeName || 'Current User',
      phoneNumber: phoneNumber,
      duration: formatDur(callDurationSeconds),
      durationSeconds: callDurationSeconds,
      status: 'completed',
      outcome: selectedOutcome,
      notes: callNotes.trim() || `Outbound consultation session. Outcome: ${selectedOutcome}.`,
    });

    setLastLoggedCallId(record.id);
    setCallStatus('ready');
  };

  const recordingStatus: RecordingStatus =
    callStatus === 'connected' ? 'recording' : callStatus === 'dialing' || callStatus === 'ringing' ? 'processing' : 'not_recording';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Telephony & Dialer"
        description="Unified outbound communications suite with live session control and contact synchronization."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Main' },
          { label: 'Calling' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Prospect Queue:</span>
            <select
              value={selectedLeadId || ''}
              onChange={(e) => {
                setSelectedLeadId(e.target.value);
                const l = leads.find((lead) => lead.id === e.target.value);
                if (l) setPhoneNumber(l.phone);
              }}
              disabled={callStatus !== 'ready' && callStatus !== 'completed'}
              className="h-8 px-2.5 bg-[#0e0e13] border border-white/15 text-xs text-slate-200 rounded-lg outline-none cursor-pointer focus:border-white/30 max-w-[200px] truncate"
              aria-label="Select Target Lead"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.company})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Target Lead Context Banner */}
      {selectedLead && (
        <Card className="p-4 sm:p-5 bg-[#0c0c11]/80 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-semibold text-white">
                  {selectedLead.name}
                </span>
                <LeadStatusBadge status={selectedLead.status} />
                <span className="hidden sm:inline-block text-slate-600">•</span>
                <span className="text-xs text-slate-400">{selectedLead.title}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedLead.company}</span>
                </div>
                {selectedLead.dealValue && (
                  <div className="text-emerald-400 font-mono">
                    {selectedLead.dealValue}
                  </div>
                )}
                {selectedLead.assignedEmployeeName && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Assigned: {selectedLead.assignedEmployeeName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/[0.06]">
              <div className="text-left lg:text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  AI Intent Score
                </span>
                <LeadScore score={selectedLead.score} />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.hash = `/leads/${selectedLead.id}`)}
                className="h-8 text-xs text-slate-300"
              >
                Lead Dossier
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Calling Station: 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dialer Keypad (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 bg-[#0c0c11]/80 border border-white/10 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] text-xs font-medium text-slate-400">
              <span className="uppercase font-mono text-[11px] tracking-wider">
                Sales Keypad
              </span>
              <span className="text-slate-500 font-mono text-[10px]">DTMF Audio Ready</span>
            </div>

            <Dialer
              phoneNumber={phoneNumber}
              onChange={setPhoneNumber}
              disabled={callStatus !== 'ready'}
            />
          </Card>
        </div>

        {/* Right Column: Live Session Interface (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 bg-[#0c0c11]/80 border border-white/10 min-h-[440px] flex flex-col justify-between space-y-6">
            {/* Session Top Telemetry */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <CallStatus status={callStatus} />
              <RecordingIndicator status={recordingStatus} />
            </div>

            {/* Active Session Display Visualizer */}
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              {/* Call Target Avatar / Status Circle */}
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                    callStatus === 'connected'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-xl shadow-emerald-950/50'
                      : callStatus === 'on_hold'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : callStatus === 'dialing' || callStatus === 'ringing'
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 animate-pulse'
                      : 'bg-white/[0.03] border-white/10 text-slate-400'
                  }`}
                >
                  <PhoneCall className="w-8 h-8" />
                </div>

                {callStatus === 'connected' && (
                  <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-zinc-950 shadow-md">
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
              </div>

              {/* Target & Phone text */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {selectedLead ? selectedLead.name : 'Outbound Number'}
                </h3>
                <p className="font-mono text-sm text-slate-400">
                  {phoneNumber ? formatPhoneNumber(phoneNumber) : 'No phone number entered'}
                </p>
                {selectedLead && (
                  <p className="text-xs text-slate-500">
                    {selectedLead.company} • {selectedLead.title}
                  </p>
                )}
              </div>

              {/* Live Call Duration Timer */}
              <div className="pt-2">
                <CallTimer
                  status={callStatus}
                  size="lg"
                  onTick={(secs) => setCallDurationSeconds(secs)}
                />
              </div>

              {/* Audio Status Pills */}
              {(callStatus === 'connected' || callStatus === 'on_hold') && (
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                      isMuted
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-white/[0.04] border-white/10 text-slate-400'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    {isMuted ? 'Mic Muted' : 'Mic Active'}
                  </span>

                  {isOnHold && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-300">
                      Hold Music Playing
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Post-Call Outcome Logger (Shows when completed) */}
            {callStatus === 'completed' && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Log Call Disposition & Outcome
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Duration: {Math.floor(callDurationSeconds / 60)}m {callDurationSeconds % 60}s
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'interested', label: 'Interested' },
                    { id: 'converted', label: 'Converted' },
                    { id: 'follow_up_required', label: 'Follow-up' },
                    { id: 'no_answer', label: 'No Answer' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOutcome(opt.id as CallOutcome)}
                      className={`py-1.5 px-2 rounded-lg border font-medium text-xs transition-colors ${
                        selectedOutcome === opt.id
                          ? 'bg-white text-zinc-950 border-white'
                          : 'bg-[#0e0e13] text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Add quick call notes or agreed commitments..."
                  className="w-full h-8 px-3 bg-[#0e0e13] border border-white/10 text-xs text-slate-100 rounded-lg outline-none focus:border-white/30"
                />
              </div>
            )}

            {/* Call Controls Action Bar */}
            <div className="pt-4 border-t border-white/[0.06]">
              <CallControls
                status={callStatus}
                isMuted={isMuted}
                isOnHold={isOnHold}
                hasPhoneNumber={Boolean(phoneNumber && phoneNumber.length >= 7)}
                onStartCall={handleStartCall}
                onEndCall={handleEndCall}
                onToggleMute={() => setIsMuted(!isMuted)}
                onToggleHold={() => setIsOnHold(!isOnHold)}
                onCallAgain={handleCallAgain}
                onSaveOutcome={callStatus === 'completed' ? handleSaveOutcome : undefined}
                onViewDetails={
                  lastLoggedCallId
                    ? () => (window.location.hash = `/calling/${lastLoggedCallId}`)
                    : undefined
                }
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Call History & Logs */}
      <CallHistory history={callHistory} />
    </div>
  );
};
