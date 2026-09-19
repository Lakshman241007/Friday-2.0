import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateLeadInput, LeadSource, LeadStatus } from '../leads.types';
import { EmployeeSummary } from '@/features/assignment/assignment.types';
import { Building2, Mail, Phone, User, DollarSign } from 'lucide-react';

export interface LeadFormProps {
  initialValues?: Partial<CreateLeadInput>;
  employees: EmployeeSummary[];
  onSubmit: (data: CreateLeadInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  initialValues,
  employees,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CreateLeadInput>({
    name: initialValues?.name || '',
    title: initialValues?.title || '',
    company: initialValues?.company || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    source: initialValues?.source || 'inbound',
    status: initialValues?.status || 'new',
    assignedEmployeeId: initialValues?.assignedEmployeeId || '',
    dealValue: initialValues?.dealValue || '',
    notes: initialValues?.notes || '',
    score: initialValues?.score || 70,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Contact full name is required.';
    if (!formData.company.trim()) errs.company = 'Company name is required.';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (formData.phone.replace(/\D/g, '').length < 7) {
      errs.phone = 'Please enter a valid phone number with area code.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Corporate email address is required.';
    } else if (!formData.email.includes('@')) {
      errs.email = 'Please enter a valid email format.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Find assigned employee name
    let assignedName: string | undefined;
    if (formData.assignedEmployeeId) {
      const emp = employees.find((em) => em.id === formData.assignedEmployeeId);
      assignedName = emp?.name;
    }

    onSubmit({
      ...formData,
      assignedEmployeeName: assignedName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Primary Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Input
          id="lead-name"
          label="Contact Full Name *"
          placeholder="e.g. Jessica Reynolds"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          leftIcon={<User className="w-4 h-4" />}
          disabled={isSubmitting}
        />

        <Input
          id="lead-title"
          label="Job Title / Role"
          placeholder="e.g. VP Infrastructure"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={isSubmitting}
        />

        <Input
          id="lead-company"
          label="Company / Account Name *"
          placeholder="e.g. Nexus Capital Partners"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          error={errors.company}
          leftIcon={<Building2 className="w-4 h-4" />}
          disabled={isSubmitting}
        />

        <Input
          id="lead-deal"
          label="Estimated Deal Value"
          placeholder="e.g. $45,000 ARR"
          value={formData.dealValue}
          onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
          leftIcon={<DollarSign className="w-4 h-4" />}
          disabled={isSubmitting}
        />

        <Input
          id="lead-email"
          label="Corporate Email *"
          placeholder="e.g. jreynolds@nexuscapital.com"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          disabled={isSubmitting}
        />

        <Input
          id="lead-phone"
          label="Direct Phone Number *"
          placeholder="e.g. +1 (617) 991-5501"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
          leftIcon={<Phone className="w-4 h-4" />}
          disabled={isSubmitting}
        />
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Source */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-source" className="text-xs font-medium text-slate-300">
            Acquisition Source
          </label>
          <select
            id="lead-source"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value as LeadSource })
            }
            disabled={isSubmitting}
            className="w-full h-10 px-3 bg-[#0e0e13] text-slate-100 text-xs border border-white/10 rounded-lg outline-none focus:border-white/30"
          >
            <option value="inbound">Inbound Demo Request</option>
            <option value="outbound">Outbound Research</option>
            <option value="website">Direct Website</option>
            <option value="referral">Advisory Referral</option>
            <option value="event">Industry Event / Summit</option>
            <option value="partner">Cloud Partner</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-status" className="text-xs font-medium text-slate-300">
            Initial Status
          </label>
          <select
            id="lead-status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as LeadStatus })
            }
            disabled={isSubmitting}
            className="w-full h-10 px-3 bg-[#0e0e13] text-slate-100 text-xs border border-white/10 rounded-lg outline-none focus:border-white/30"
          >
            <option value="new">New (Uncontacted)</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="interested">Interested</option>
            <option value="follow-up">Follow-up</option>
          </select>
        </div>

        {/* Assigned Rep */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-assigned-rep" className="text-xs font-medium text-slate-300">
            Assign Representative
          </label>
          <select
            id="lead-assigned-rep"
            value={formData.assignedEmployeeId || ''}
            onChange={(e) =>
              setFormData({ ...formData, assignedEmployeeId: e.target.value })
            }
            disabled={isSubmitting}
            className="w-full h-10 px-3 bg-[#0e0e13] text-slate-100 text-xs border border-white/10 rounded-lg outline-none focus:border-white/30"
          >
            <option value="">Awaiting Queue Distribution</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes / Context */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-notes" className="text-xs font-medium text-slate-300">
          Account Notes & Operational Requirements
        </label>
        <textarea
          id="lead-notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isSubmitting}
          placeholder="Include context on customer infrastructure, qualification requirements, or key concerns..."
          className="w-full p-3 bg-[#0e0e13] text-slate-100 placeholder:text-slate-500 text-xs border border-white/10 rounded-lg outline-none focus:border-white/30 resize-y"
        />
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 text-xs"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="px-5 text-xs font-medium"
        >
          Create Lead Profile
        </Button>
      </div>
    </form>
  );
};
