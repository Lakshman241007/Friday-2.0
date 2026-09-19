import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { LeadForm } from '../components/LeadForm';
import { CreateLeadInput } from '../leads.types';
import { phase4Store } from '../leads.data';
import { APP_NAME } from '@/lib/constants';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CreateLeadPage: React.FC = () => {
  const [employees] = useState(() => phase4Store.getEmployees());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    window.location.hash = '/leads';
  };

  const handleSubmit = async (data: CreateLeadInput) => {
    setIsSubmitting(true);
    // Simulate brief network latency
    await new Promise((r) => setTimeout(r, 250));

    const newLead = phase4Store.addLead({
      name: data.name,
      title: data.title || 'Decision Maker',
      company: data.company,
      email: data.email,
      phone: data.phone,
      source: data.source,
      status: data.status,
      score: data.score ?? 75,
      assignedEmployeeId: data.assignedEmployeeId,
      assignedEmployeeName: data.assignedEmployeeName,
      dealValue: data.dealValue,
      notes: data.notes,
      nextAction: 'Initial Discovery Call',
    });

    setIsSubmitting(false);
    // Navigate directly to the newly created lead details
    window.location.hash = `/leads/${newLead.id}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-8 px-2.5 text-xs text-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Leads
        </Button>
      </div>

      <PageHeader
        title="Create New Lead"
        description="Provision a new prospect record with qualification metadata and automated rep distribution."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Leads', href: '#/leads' },
          { label: 'Create' },
        ]}
      />

      <Card className="p-6 sm:p-8 bg-[#0c0c11]/80 backdrop-blur-xs border border-white/10">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/[0.06] text-xs font-mono text-slate-400">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>FRIDAY Prospect Ingestion Engine • All fields stored securely</span>
        </div>

        <LeadForm
          employees={employees}
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};
