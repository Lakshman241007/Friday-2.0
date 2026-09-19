import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FollowUp, FollowUpFormData, FollowUpPriority, FollowUpType } from '../followups.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Calendar, Clock, User, Building2, AlertCircle, FileText } from 'lucide-react';

export interface FollowUpFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FollowUpFormData) => void;
  initialData?: FollowUp | null;
  defaultCallId?: string;
  defaultLeadName?: string;
  defaultCompany?: string;
}

export const FollowUpForm: React.FC<FollowUpFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultCallId,
  defaultLeadName,
  defaultCompany,
}) => {
  const [leadName, setLeadName] = useState(initialData?.leadName || defaultLeadName || 'Elena Rostova');
  const [company, setCompany] = useState(initialData?.company || defaultCompany || 'Apex Robotics');
  const [employeeName, setEmployeeName] = useState(initialData?.employeeName || 'Sarah Jenkins');
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || 'emp-1');
  const [type, setType] = useState<FollowUpType>(initialData?.type || 'Demo');
  const [priority, setPriority] = useState<FollowUpPriority>(initialData?.priority || 'High');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || 'Tomorrow, Sep 20');
  const [dueTime, setDueTime] = useState(initialData?.dueTime || '10:00 AM CET');
  const [notes, setNotes] = useState(
    initialData?.notes || 'Conduct technical pilot review of German GDPR data residency dossier.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      leadId: initialData?.leadId || 'lead-101',
      leadName,
      company,
      employeeId,
      employeeName,
      type,
      priority,
      dueDate,
      dueTime,
      notes,
      callId: initialData?.callId || defaultCallId,
    });
    onClose();
  };

  const types: FollowUpType[] = [
    'Callback',
    'Demo',
    'Send Information',
    'Follow-up Call',
    'Proposal',
    'Check-in',
    'Renewal',
    'Other',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Follow-up Commitment' : 'Schedule Operational Follow-up'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Lead & Organization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Lead Contact Name
            </label>
            <Input
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Company / Entity
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Apex Robotics"
              required
            />
          </div>
        </div>

        {/* Assigned Representative & Task Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Responsible Owner
            </label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                const names: Record<string, string> = {
                  'emp-1': 'Sarah Jenkins',
                  'emp-2': 'Alex Chen',
                  'emp-3': 'David Kim',
                  'usr_emp_01': 'Elena Rostova',
                };
                setEmployeeName(names[e.target.value] || 'Sarah Jenkins');
              }}
              className="w-full bg-[#121218] border border-white/15 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-white/30"
            >
              <option value="emp-1">Sarah Jenkins (Senior AE)</option>
              <option value="emp-2">Alex Chen (Outbound Specialist)</option>
              <option value="emp-3">David Kim (Solutions Engineer)</option>
              <option value="usr_emp_01">Elena Rostova (Account Executive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Action Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FollowUpType)}
              className="w-full bg-[#121218] border border-white/15 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-white/30"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date, Time, Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Due Date
            </label>
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Sep 20, 2026"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Due Time
            </label>
            <Input
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. 10:00 AM"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Priority Tier
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as FollowUpPriority)}
              className="w-full bg-[#121218] border border-white/15 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-white/30"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
        </div>

        {/* Notes & Agenda */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Agenda & Context Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Document specific customer commitments or requirements..."
            className="w-full bg-[#121218] border border-white/15 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-white/30 resize-none font-sans"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="bg-white text-zinc-950 hover:bg-slate-200">
            {initialData ? 'Save Changes' : 'Schedule Commitment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
