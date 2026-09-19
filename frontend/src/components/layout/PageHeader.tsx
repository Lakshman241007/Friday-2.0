import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  status?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  status,
  metadata,
  actions,
  breadcrumbs,
  className,
}) => {
  return (
    <div
      id="friday-page-header"
      className={cn(
        'flex flex-col gap-3.5 pb-6 border-b border-white/[0.08] transition-all',
        className
      )}
    >
      {/* Breadcrumbs Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
                {crumb.onClick || crumb.href ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="hover:text-slate-200 transition-colors focus:outline-none"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-slate-300 font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
            {status && <div className="shrink-0">{status}</div>}
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}

          {metadata && (
            <div className="pt-1 flex items-center gap-3 text-xs text-slate-500 font-mono">
              {metadata}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
