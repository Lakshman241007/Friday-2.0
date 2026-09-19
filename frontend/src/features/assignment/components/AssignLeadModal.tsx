import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmployeeSelector } from './EmployeeSelector';
import { EmployeeSummary } from '../assignment.types';
import { Lead } from '@/features/leads/leads.types';
import { UserCheck } from 'lucide-react';

export interface AssignLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  employees: EmployeeSummary[];
  onClose: () => void;
  onAssign: (employeeId: string, reason?: string) => void;
}

export const AssignLeadModal: React.FC<AssignLeadModalProps> = ({
  isOpen,
  lead,
  employees,
  onClose,
  onAssign,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    lead?.assignedEmployeeId || employees[0]?.id || ''
  );
  const [reason, setReason] = useState('');

  if (!lead) return null;

  const handleConfirm = () => {
    if (!selectedEmpId) return;
    onAssign(selectedEmpId, reason.trim() || undefined);
    onClose();
  };

  const currentRep = lead.assignedEmployeeName || 'Unassigned';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-400" />
          <span>Assign Representative</span>
        </div>
      }
      description={`Distribute prospect ${lead.name} (${lead.company}) to an active sales representative.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} className="px-4 text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedEmpId}
            onClick={handleConfirm}
            className="px-4 text-xs bg-indigo-600 hover:bg-indigo-500"
          >
            Confirm Assignment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Lead Context Pill */}
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">
              Current Owner
            </span>
            <span className="font-semibold text-slate-200">{currentRep}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px] uppercase font-mono">
              Lead Score
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              {lead.score}/100
            </span>
          </div>
        </div>

        {/* Rep Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Select Sales Representative
          </label>
          <EmployeeSelector
            employees={employees}
            selectedEmployeeId={selectedEmpId}
            onSelect={setSelectedEmpId}
          />
        </div>

        {/* Reason / Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Assignment Reason / Routing Policy (Optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. FinTech specialization or capacity rebalance"
            className="w-full h-9 px-3 bg-[#0e0e13] border border-white/10 text-xs text-slate-100 rounded-lg outline-none focus:border-white/30"
          />
        </div>
      </div>
    </Modal>
  );
};
