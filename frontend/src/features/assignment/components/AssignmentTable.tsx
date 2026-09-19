import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Assignment } from '../assignment.types';
import { UserCheck, Building2, UserX } from 'lucide-react';

export interface AssignmentTableProps {
  assignments: Assignment[];
  onReassign: (assignment: Assignment) => void;
  isLoading?: boolean;
}

export const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  onReassign,
  isLoading = false,
}) => {
  return (
    <Table
      isLoading={isLoading}
      isEmpty={assignments.length === 0}
      emptyMessage="No assignments found in the system queue."
    >
      <TableHeader>
        <tr>
          <TableHead className="w-[28%]">Lead & Organization</TableHead>
          <TableHead className="w-[22%]">Assigned Representative</TableHead>
          <TableHead className="w-[14%]">Status</TableHead>
          <TableHead className="w-[18%]">Assigned By / Engine</TableHead>
          <TableHead className="w-[10%]">Priority</TableHead>
          <TableHead className="w-[8%] text-right">Actions</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {assignments.map((asg) => {
          const isAssigned = asg.status === 'assigned';

          return (
            <TableRow key={asg.id} className="hover:bg-white/[0.04]">
              {/* Lead & Organization */}
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-100">
                    {asg.leadName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{asg.company}</span>
                  </div>
                </div>
              </TableCell>

              {/* Assigned Rep */}
              <TableCell>
                {isAssigned ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-mono text-[10px] font-semibold text-indigo-300">
                      {asg.employeeInitials}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-200">
                        {asg.employeeName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {asg.employeeRole}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400/90 text-xs">
                    <UserX className="w-4 h-4 text-amber-500" />
                    <span>Unassigned Queue</span>
                  </div>
                )}
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant={isAssigned ? 'active' : 'warning'}
                  size="sm"
                  dot
                >
                  {isAssigned ? 'Assigned' : 'Unassigned'}
                </Badge>
              </TableCell>

              {/* Assigned By */}
              <TableCell>
                <div className="flex flex-col text-xs">
                  <span className="text-slate-300">{asg.assignedBy}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {asg.assignedDate.includes('T')
                      ? new Date(asg.assignedDate).toLocaleDateString()
                      : asg.assignedDate}
                  </span>
                </div>
              </TableCell>

              {/* Priority */}
              <TableCell>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase ${
                    asg.priority === 'urgent'
                      ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                      : asg.priority === 'high'
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-slate-400 bg-white/[0.04] border border-white/10'
                  }`}
                >
                  {asg.priority}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReassign(asg)}
                  className="h-7 text-xs px-2.5 text-slate-300 hover:text-white"
                >
                  <UserCheck className="w-3 h-3 mr-1" />
                  {isAssigned ? 'Reassign' : 'Assign'}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
