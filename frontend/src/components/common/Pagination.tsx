import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  totalItems,
  pageSize,
}) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-slate-400',
        className
      )}
    >
      <div>
        {totalItems !== undefined && pageSize !== undefined ? (
          <span>
            Showing{' '}
            <strong className="text-slate-200">
              {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-200">
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-slate-200">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-200">{currentPage}</strong> of{' '}
            <strong className="text-slate-200">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = i + 1;
            const isActive = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium transition-colors select-none',
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                {pageNumber}
              </button>
            );
          })}
          {totalPages > 5 && <span className="px-1 text-slate-600">...</span>}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 text-xs"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
