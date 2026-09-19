import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DropdownProps {
  items: DropdownItem[];
  selectedId?: string;
  onSelect: (item: DropdownItem) => void;
  trigger?: React.ReactNode;
  placeholder?: string;
  align?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  selectedId,
  onSelect,
  trigger,
  placeholder = 'Select option',
  align = 'left',
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((i) => i.id === selectedId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
      {trigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center justify-between gap-2.5 h-9.5 px-3.5 bg-[#0e0e13] border border-white/10 rounded-lg text-sm text-slate-200 hover:border-white/20 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-white/20',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedItem?.icon}
            <span className={!selectedItem ? 'text-slate-500' : 'text-slate-100'}>
              {selectedItem ? selectedItem.label : placeholder}
            </span>
          </span>
          <ChevronDown
            className={cn('w-4 h-4 text-slate-400 transition-transform duration-150', isOpen && 'rotate-180')}
          />
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 w-52 rounded-xl bg-[#0e0e14] border border-white/10 shadow-xl shadow-black/80 py-1 overflow-hidden focus:outline-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="listbox"
        >
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors',
                  item.destructive
                    ? 'text-red-400 hover:bg-red-950/30'
                    : isSelected
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
                  item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                )}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon && <span className="text-slate-400 shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-200 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
