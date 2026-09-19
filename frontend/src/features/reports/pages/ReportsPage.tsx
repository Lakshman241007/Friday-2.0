import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ReportFilters } from '../components/ReportFilters';
import { PerformanceReport } from '../components/PerformanceReport';
import { ConversionReport } from '../components/ConversionReport';
import { CallQualityReport } from '../components/CallQualityReport';
import { ObjectionReport } from '../components/ObjectionReport';
import { SentimentReport } from '../components/SentimentReport';
import { reportsApi } from '../reports.api';
import {
  ReportFilters as ReportFiltersType,
  PerformanceReportData,
  ConversionReportData,
  CallQualityReportData,
  ObjectionReportData,
  SentimentReportData,
} from '../reports.types';
import { APP_NAME } from '@/lib/constants';
import {
  BarChart3,
  Download,
  Target,
  Sparkles,
  ShieldAlert,
  Smile,
  Activity,
  Check,
} from 'lucide-react';

type ReportTab = 'performance' | 'conversion' | 'quality' | 'objections' | 'sentiment';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('performance');
  const [filters, setFilters] = useState<ReportFiltersType>({
    dateRange: '7d',
    employeeId: 'all',
    outcome: 'all',
    sentiment: 'all',
  });

  const [perfData, setPerfData] = useState<PerformanceReportData | null>(null);
  const [convData, setConvData] = useState<ConversionReportData | null>(null);
  const [qualityData, setQualityData] = useState<CallQualityReportData | null>(null);
  const [objectionData, setObjectionData] = useState<ObjectionReportData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exported, setExported] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      reportsApi.getPerformanceReport(filters),
      reportsApi.getConversionReport(filters),
      reportsApi.getCallQualityReport(filters),
      reportsApi.getObjectionReport(filters),
      reportsApi.getSentimentReport(filters),
    ]).then(([p, c, q, o, s]) => {
      setPerfData(p);
      setConvData(c);
      setQualityData(q);
      setObjectionData(o);
      setSentimentData(s);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const handleNavigateToAnalysis = (callId: string) => {
    window.location.hash = `/analysis/${callId}`;
  };

  const tabs = [
    { id: 'performance', label: 'Performance & Volume', icon: Activity },
    { id: 'conversion', label: 'Conversion Funnel', icon: Target },
    { id: 'quality', label: 'Call Quality Scoring', icon: Sparkles },
    { id: 'objections', label: 'Objection Clusters', icon: ShieldAlert },
    { id: 'sentiment', label: 'Sentiment Dynamics', icon: Smile },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Telephony Analytics & Operational Reports"
        description="Comprehensive intelligence digests across calling volume, conversion outcomes, quality scores, and objection patterns."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Management' },
          { label: 'Reports' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-8 text-xs text-slate-300 hover:text-white"
            >
              {exported ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span className="text-emerald-400">Exported CSV</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Export Report</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* FILTER BAR */}
      <ReportFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={() => {
          setFilters({
            dateRange: '7d',
            employeeId: 'all',
            outcome: 'all',
            sentiment: 'all',
          });
        }}
      />

      {/* REPORT SELECTION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.08] pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT VIEW */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          Compiling report matrices...
        </div>
      ) : (
        <div>
          {activeTab === 'performance' && perfData && (
            <PerformanceReport data={perfData} />
          )}
          {activeTab === 'conversion' && convData && (
            <ConversionReport data={convData} />
          )}
          {activeTab === 'quality' && qualityData && (
            <CallQualityReport data={qualityData} />
          )}
          {activeTab === 'objections' && objectionData && (
            <ObjectionReport
              data={objectionData}
              onNavigateToAnalysis={handleNavigateToAnalysis}
            />
          )}
          {activeTab === 'sentiment' && sentimentData && (
            <SentimentReport data={sentimentData} />
          )}
        </div>
      )}
    </div>
  );
};
