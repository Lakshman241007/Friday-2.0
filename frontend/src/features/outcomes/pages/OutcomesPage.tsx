import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AccuracyCard } from '../AccuracyCard';
import { OutcomeComparison } from '../OutcomeComparison';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { SearchBar } from '@/components/common/SearchBar';
import { OutcomeComparison as OutcomeComparisonType, OutcomeComparisonStatus } from '../outcomes.types';
import { aiAnalysisStore } from '@/features/ai-analysis/ai-analysis.data';
import { APP_NAME } from '@/lib/constants';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Slash,
  Building2,
  ArrowRight,
  GitCompare,
  Calendar,
} from 'lucide-react';

export const OutcomesPage: React.FC = () => {
  const [comparisons] = useState<OutcomeComparisonType[]>(() =>
    aiAnalysisStore.getAllComparisons()
  );
  const [metrics] = useState(() => aiAnalysisStore.getMetrics());
  const [selectedComparison, setSelectedComparison] = useState<OutcomeComparisonType | null>(
    comparisons[0] || null
  );
  const [statusFilter, setStatusFilter] = useState<'all' | OutcomeComparisonStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = comparisons.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.leadName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.employeeName.toLowerCase().includes(q) ||
        c.callId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: OutcomeComparisonStatus) => {
    switch (status) {
      case 'match':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Match</span>
          </span>
        );
      case 'different':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Different</span>
          </span>
        );
      case 'unavailable':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
            <Slash className="w-3 h-3 text-slate-500" />
            <span>Unavailable</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resolution Outcomes & Concordance"
        description="Side-by-side verification comparing representative dispositions with AI semantic classifications."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Intelligence' },
          { label: 'Outcomes' },
        ]}
      />

      {/* Aggregate Accuracy & Benchmark Summary */}
      <AccuracyCard metrics={metrics} />

      {/* Filter and Directory Header */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by prospect, company, agent, or call ID..."
            className="max-w-md w-full"
          />

          <div className="flex items-center gap-1 bg-[#09090d] p-1 rounded-lg border border-white/10 overflow-x-auto">
            {(['all', 'match', 'different', 'unavailable'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 text-xs font-medium rounded capitalize whitespace-nowrap transition-colors ${
                  statusFilter === filter
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table */}
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0c0c11]/80">
          <Table
            isEmpty={filtered.length === 0}
            emptyMessage="No outcome comparison records match your search criteria."
          >
            <TableHeader>
              <tr>
                <TableHead className="w-[28%]">Session / Prospect</TableHead>
                <TableHead className="w-[18%]">Representative</TableHead>
                <TableHead className="w-[18%]">Human Outcome</TableHead>
                <TableHead className="w-[18%]">AI Outcome</TableHead>
                <TableHead className="w-[10%]">Alignment</TableHead>
                <TableHead className="w-[8%] text-right">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const isSelected = selectedComparison?.callId === item.callId;

                return (
                  <TableRow
                    key={item.callId}
                    onClick={() => setSelectedComparison(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100">{item.leadName}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{item.company}</span>
                          <span className="text-slate-600 font-mono">•</span>
                          <span className="font-mono text-[10px] text-slate-500">#{item.callId}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-slate-200">{item.employeeName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.callDate}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-slate-200">
                        {item.humanOutcome?.outcome || 'Not Recorded'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-emerald-300">
                        {item.aiOutcome?.outcome || 'Pending'}
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.hash = `/analysis/${item.callId}`;
                        }}
                        className="h-7 text-xs px-2.5 text-slate-400 hover:text-white"
                        title="View Full Call Intelligence"
                      >
                        <span>Analysis</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Selected Call Deep Inspection */}
      {selectedComparison && (
        <div className="pt-2">
          <OutcomeComparison comparison={selectedComparison} />
        </div>
      )}
    </div>
  );
};
