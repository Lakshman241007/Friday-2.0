import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({
  className,
  wrapperClassName,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
  children,
  ...props
}) => {
  return (
    <div className={cn('relative w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0c11]', wrapperClassName)}>
      <table className={cn('w-full text-left border-collapse text-xs', className)} {...props}>
        {children}
      </table>

      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-slate-400 bg-[#0c0c11]/80 backdrop-blur-xs">
          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          <span className="text-xs font-medium text-slate-400">Loading records...</span>
        </div>
      )}

      {!isLoading && isEmpty && (
        <div className="py-12 text-center text-xs text-slate-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={cn('bg-[#111116] border-b border-white/[0.08] text-slate-400 select-none', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={cn('divide-y divide-white/[0.04]', className)} {...props}>
    {children}
  </tbody>
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  className,
  isSelected = false,
  children,
  ...props
}) => (
  <tr
    className={cn(
      'transition-colors duration-100 group',
      isSelected
        ? 'bg-white/[0.07]'
        : 'hover:bg-white/[0.03]',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th
    className={cn(
      'h-9.5 px-4 font-medium text-slate-400 text-left align-middle tracking-wider uppercase text-[11px] whitespace-nowrap',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={cn('p-4 align-middle text-slate-300 leading-normal whitespace-nowrap', className)} {...props}>
    {children}
  </td>
);
