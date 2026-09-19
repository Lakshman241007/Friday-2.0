import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { LeadStatus } from '../leads.types';
import { getLeadStatusBadgeVariant, getLeadStatusLabel } from '../leads.utils';

export interface LeadStatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({
  status,
  size = 'sm',
  className,
}) => {
  const variant = getLeadStatusBadgeVariant(status);
  const label = getLeadStatusLabel(status);

  return (
    <Badge
      variant={variant}
      size={size}
      dot
      className={className}
    >
      {label}
    </Badge>
  );
};
