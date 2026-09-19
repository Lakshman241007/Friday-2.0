import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  shortcut?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  placeholder = 'Search records, tokens, metrics...',
  shortcut = '⌘K',
  className,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (newVal: string) => {
    if (!isControlled) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  return (
    <div
      className={cn(
        'relative flex items-center w-full max-w-md h-9.5 px-3 bg-[#0d0d12] border border-white/10 rounded-lg focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/15 transition-all',
        className
      )}
    >
      <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => handleChange('')}
          className="p-1 text-slate-400 hover:text-white rounded"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : shortcut ? (
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white/[0.04] border border-white/10 rounded">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
};
