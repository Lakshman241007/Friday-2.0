import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { AnalysisStatus } from '../components/AnalysisStatus';
import { AnalysisOverview } from '../components/AnalysisOverview';
import { SummaryCard } from '../components/SummaryCard';
import { IntentCard } from '../components/IntentCard';
import { SentimentCard } from '../components/SentimentCard';
import { ObjectionCard } from '../components/ObjectionCard';
import { KeywordCard } from '../components/KeywordCard';
import { OutcomeCard } from '../components/OutcomeCard';
import { OutcomeComparison } from '@/features/outcomes/OutcomeComparison';
import { AccuracyCard } from '@/features/outcomes/AccuracyCard';
import { AIAnalysis } from '../ai-analysis.types';
import { OutcomeComparison as OutcomeComparisonType } from '@/features/outcomes/outcomes.types';
import { aiAnalysisStore } from '../ai-analysis.data';
import { APP_NAME } from '@/lib/constants';
import {
  BrainCircuit,
  Disc,
  FileText,
  PhoneCall,
  User,
  Building2,
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export interface AnalysisPageProps {
  callId?: string;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ callId: propCallId }) => {
  // Extract callId from hash or prop
  const getCallIdFromHash = () => {
    if (propCallId) return propCallId;
    const hash = window.location.hash;
    const match = hash.match(/\/analysis\/([^?&]+)/);
    if (match) return match[1];
    const queryMatch = hash.match(/callId=([^&]+)/);
    if (queryMatch) return queryMatch[1];
    return 'call-901'; // Default demo call
  };

  const [activeCallId, setActiveCallId] = useState<string>(getCallIdFromHash);
  const [analysis, setAnalysis] = useState<AIAnalysis | undefined>(() =>
    aiAnalysisStore.getAnalysis(activeCallId)
  );
  const [comparison, setComparison] = useState<OutcomeComparisonType | undefined>(() =>
    aiAnalysisStore.getComparison(activeCallId)
  );
  const [metrics] = useState(() => aiAnalysisStore.getMetrics());
  const [isLoading, setIsLoading] = useState(false);

  const allAnalyses = aiAnalysisStore.getAllAnalyses();

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const newCallId = getCallIdFromHash();
      if (newCallId && newCallId !== activeCallId) {
        setIsLoading(true);
        setActiveCallId(newCallId);
        setTimeout(() => {
          setAnalysis(aiAnalysisStore.getAnalysis(newCallId));
          setComparison(aiAnalysisStore.getComparison(newCallId));
          setIsLoading(false);
        }, 120);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeCallId]);

  const handleSelectCall = (newId: string) => {
    setIsLoading(true);
    setActiveCallId(newId);
    window.location.hash = `/analysis/${newId}`;
    setTimeout(() => {
      setAnalysis(aiAnalysisStore.getAnalysis(newId));
      setComparison(aiAnalysisStore.getComparison(newId));
      setIsLoading(false);
    }, 120);
  };

  // Navigations to related Phase 4 & Phase 5 experiences
  const handleNavigateToRecording = (timestampSeconds?: number) => {
    if (timestampSeconds !== undefined) {
      window.location.hash = `/recordings?callId=${activeCallId}&seek=${timestampSeconds}`;
    } else {
      window.location.hash = `/recordings?callId=${activeCallId}`;
    }
  };

  const handleNavigateToTranscript = () => {
    window.location.hash = `/transcripts?callId=${activeCallId}`;
  };

  const handleNavigateToCall = () => {
    window.location.hash = `/calling/${activeCallId}`;
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingState label="Synthesizing Call Intelligence..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Call Intelligence"
          description="Autonomous dialogue evaluation, objection detection, and outcome prediction."
          breadcrumbs={[
            { label: APP_NAME, href: '#/dashboard' },
            { label: 'Intelligence' },
            { label: 'AI Analysis' },
          ]}
        />
        <div className="p-8">
          <EmptyState
            title="Analysis Record Unavailable"
            description={`No conversational evaluation found for session #${activeCallId}.`}
            actionLabel="Return to Session 901"
            onAction={() => handleSelectCall('call-901')}
          />
        </div>
      </div>
    );
  }

  // Handle Failed or Processing States cleanly
  const isCompleted = analysis.status === 'completed';

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Call Intelligence & Analysis"
        description="Autonomous dialogue evaluation, intent categorization, and outcome verification."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Intelligence' },
          { label: 'AI Analysis' },
          { label: `#${analysis.callId}` },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Session Switcher Dropdown */}
            <div className="flex items-center gap-2 bg-[#09090d] p-1 rounded-lg border border-white/10 text-xs">
              <span className="text-slate-400 pl-2 hidden sm:inline">Session:</span>
              <select
                value={activeCallId}
                onChange={(e) => handleSelectCall(e.target.value)}
                className="bg-[#121218] border border-white/15 text-xs text-slate-200 rounded-md px-2.5 py-1 outline-none cursor-pointer focus:border-white/30 truncate max-w-[220px]"
                aria-label="Select call session to inspect"
              >
                {allAnalyses.map((a) => (
                  <option key={a.callId} value={a.callId}>
                    #{a.callId} — {a.leadName} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Navigation Links */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigateToRecording()}
              className="h-8 text-xs text-slate-300 hover:text-white"
              title="Open Session Audio Player"
            >
              <Disc className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Recording</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToTranscript}
              className="h-8 text-xs text-slate-300 hover:text-white"
              title="Open Dialogue Transcript"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Transcript</span>
            </Button>
          </div>
        }
      />

      {/* COMPACT CALL CONTEXT BAR */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          {/* Lead */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-100">{analysis.leadName}</div>
              <div className="text-[11px] text-slate-400">{analysis.company}</div>
            </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Representative */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-slate-200 font-medium">{analysis.employeeName}</div>
              <div className="text-[11px] text-slate-500 font-mono">Agent #{analysis.employeeId}</div>
            </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Timing */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{analysis.callDate}</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-semibold">{analysis.duration}</span>
          </div>
        </div>

        {/* Status Badge & Call Details Link */}
        <div className="flex items-center gap-3">
          <AnalysisStatus status={analysis.status} size="md" />

          <button
            type="button"
            onClick={handleNavigateToCall}
            className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Call Details</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>

      {/* NON-COMPLETED STATES: Processing / Failed / Unavailable */}
      {!isCompleted && (
        <div className="p-6 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-4">
          <AnalysisStatus status={analysis.status} showDescription size="lg" />

          {analysis.errorMessage && (
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs text-slate-300 leading-relaxed font-mono">
              <span className="text-slate-500">Diagnostic message:</span> {analysis.errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigateToRecording()}
              className="text-xs"
            >
              <Disc className="w-3.5 h-3.5 mr-1.5" />
              Check Audio Recording
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToTranscript}
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Check Transcript
            </Button>
          </div>
        </div>
      )}

      {/* COMPLETED STATE: FULL ANALYTICAL WORKSPACE */}
      {isCompleted && (
        <div className="space-y-6">
          {/* Section 1: High-Level Overview Matrix */}
          <AnalysisOverview analysis={analysis} />

          {/* Section 2: Executive Narrative Abstract */}
          <SummaryCard summary={analysis.summary} />

          {/* Section 3: Dual Intelligence Vectors (Intent + Sentiment) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <IntentCard intent={analysis.intent} />
            <SentimentCard sentiment={analysis.sentiment} />
          </div>

          {/* Section 4: Objections Friction & Extracted Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <ObjectionCard
              objections={analysis.objections}
              onSelectTimestamp={(secs) => handleNavigateToRecording(secs)}
            />
            <KeywordCard
              keywords={analysis.keywords}
              onSelectTimestamp={(secs) => handleNavigateToRecording(secs)}
            />
          </div>

          {/* Section 5: AI Outcome Categorization */}
          <div className="grid grid-cols-1 gap-6">
            <OutcomeCard outcome={analysis.outcome} />
          </div>

          {/* Section 6: Dual Outcome Verification (AI vs. Representative) */}
          {comparison && (
            <OutcomeComparison comparison={comparison} />
          )}

          {/* Section 7: Sample Cohort Benchmark Correlation */}
          <AccuracyCard metrics={metrics} />
        </div>
      )}
    </div>
  );
};
