import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import {
  APP_NAME,
  NAV_GROUPS,
  NAVIGATION_ITEMS,
  NAV_ICON_MAP,
  NavItemConfig,
} from '@/lib/constants';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activePath = '/dashboard',
  onNavigate,
}) => {
  // Lock body scroll and handle Escape key when mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const itemsByGroup = NAV_GROUPS.map((group) => ({
    group: group.id,
    label: group.label,
    items: NAVIGATION_ITEMS.filter((item) => item.group === group.id),
  }));

  const handleItemClick = (item: NavItemConfig) => {
    onNavigate?.(item.path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-72 max-w-[85vw] bg-[#09090e] border-r border-white/10 h-full flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs">
              F
            </div>
            <div>
              <span className="text-sm font-semibold tracking-wider text-white font-mono">
                {APP_NAME}
              </span>
              <p className="text-[10px] font-mono text-slate-500 uppercase">
                Mobile Shell
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {itemsByGroup.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                  {group.label}
                </span>
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const IconComponent = NAV_ICON_MAP[item.iconName];
                  const isActive = activePath === item.path;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left group',
                        isActive
                          ? 'bg-white/[0.08] text-white font-medium border-l-2 border-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {IconComponent && (
                          <IconComponent
                            className={cn(
                              'w-4 h-4 transition-colors',
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                            )}
                          />
                        )}
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/[0.06] text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/[0.08] text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>FRIDAY AI Workspace</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online
          </span>
        </div>
      </div>
    </div>
  );
};
