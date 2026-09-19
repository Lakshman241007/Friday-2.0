import React from 'react';
import { cn } from '@/lib/utils';
import {
  APP_NAME,
  NAV_GROUPS,
  NAVIGATION_ITEMS,
  NAV_ICON_MAP,
  NavItemConfig,
  NavGroup,
} from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SidebarProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePath = '/dashboard',
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  // Group items by group
  const itemsByGroup = NAV_GROUPS.map((group) => ({
    group: group.id,
    label: group.label,
    items: NAVIGATION_ITEMS.filter((item) => item.group === group.id),
  }));

  const renderNavItem = (item: NavItemConfig) => {
    const IconComponent = NAV_ICON_MAP[item.iconName];
    const isActive = activePath === item.path;

    const buttonContent = (
      <button
        type="button"
        id={`nav-item-${item.id}`}
        onClick={() => onNavigate?.(item.path)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
        className={cn(
          'relative w-full flex items-center rounded-lg text-xs transition-all duration-150 group select-none outline-none focus-visible:ring-1 focus-visible:ring-white/30',
          isCollapsed ? 'justify-center p-2.5 my-1' : 'justify-between px-3 py-2 my-0.5',
          isActive
            ? 'bg-white/[0.08] text-white font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-white before:rounded-r'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        )}
      >
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-2.5')}>
          {IconComponent && (
            <span
              className={cn(
                'shrink-0 transition-colors duration-150',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
              )}
            >
              <IconComponent className="w-4 h-4" />
            </span>
          )}
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </div>

        {!isCollapsed && item.badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/[0.06] border border-white/10 text-slate-400 shrink-0">
            {item.badge}
          </span>
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.id} content={item.label} position="right" delayMs={50}>
          {buttonContent}
        </Tooltip>
      );
    }

    return <div key={item.id}>{buttonContent}</div>;
  };

  return (
    <aside
      id="friday-sidebar"
      aria-label="Main Navigation"
      className={cn(
        'sticky top-0 h-screen border-r border-white/[0.08] bg-[#07070a]/85 backdrop-blur-md flex flex-col justify-between shrink-0 transition-all duration-200 z-30 select-none',
        isCollapsed ? 'w-16 p-2' : 'w-64 p-3.5 sm:p-4',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex flex-col">
        <div
          className={cn(
            'flex items-center pb-3 border-b border-white/[0.06] mb-3',
            isCollapsed ? 'justify-center' : 'justify-between px-1'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs">
              F
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wider text-white font-mono leading-none">
                  {APP_NAME}
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                  AI Architecture
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4 overflow-y-auto no-scrollbar py-1">
          {itemsByGroup.map((groupSection) => (
            <div key={groupSection.group} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-2 py-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                    {groupSection.label}
                  </span>
                </div>
              ) : (
                <div className="w-full flex justify-center py-1">
                  <div className="w-4 h-px bg-white/10" />
                </div>
              )}

              <div className="space-y-0.5">
                {groupSection.items.map(renderNavItem)}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="pt-3 border-t border-white/[0.06] mt-auto">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            id="sidebar-collapse-btn"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'w-full flex items-center text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors p-2 outline-none focus-visible:ring-1 focus-visible:ring-white/25',
              isCollapsed ? 'justify-center' : 'justify-between px-2.5'
            )}
          >
            {!isCollapsed && (
              <span className="text-[11px] font-mono text-slate-500">
                Collapse Navigation
              </span>
            )}
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
