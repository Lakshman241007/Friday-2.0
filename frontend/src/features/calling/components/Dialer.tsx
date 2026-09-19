import React from 'react';
import { cn } from '@/lib/utils';
import { Delete, X } from 'lucide-react';

export interface DialerProps {
  phoneNumber: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

interface KeypadButton {
  digit: string;
  sub: string;
}

const KEYPAD_KEYS: KeypadButton[] = [
  { digit: '1', sub: ' ' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: ' ' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: ' ' },
];

export const Dialer: React.FC<DialerProps> = ({
  phoneNumber,
  onChange,
  disabled = false,
  className,
}) => {
  const handleKeyClick = (digit: string) => {
    if (disabled) return;
    onChange(phoneNumber + digit);
  };

  const handleBackspace = () => {
    if (disabled || !phoneNumber) return;
    onChange(phoneNumber.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  return (
    <div className={cn('w-full max-w-xs mx-auto space-y-4 select-none', className)}>
      {/* Phone Number Display Screen */}
      <div className="relative flex items-center justify-between h-13 px-4 rounded-xl bg-[#09090d] border border-white/10 shadow-inner">
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter phone number..."
          className="w-full bg-transparent text-center font-mono text-base font-semibold text-white tracking-wider outline-none placeholder:text-slate-600"
        />

        {phoneNumber && !disabled && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleBackspace}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
              aria-label="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-500 hover:text-slate-300 rounded-md hover:bg-white/5 transition-colors"
              aria-label="Clear number"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Modern Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2.5">
        {KEYPAD_KEYS.map((k) => (
          <button
            key={k.digit}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyClick(k.digit)}
            className={cn(
              'h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-150',
              'bg-[#0e0e14] border-white/[0.06] text-slate-100 shadow-xs',
              'hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.97] active:bg-white/[0.12]',
              disabled && 'opacity-40 cursor-not-allowed hover:bg-[#0e0e14]'
            )}
          >
            <span className="font-mono text-base font-semibold leading-tight">
              {k.digit}
            </span>
            {k.sub.trim() !== '' ? (
              <span className="text-[9px] font-mono tracking-widest text-slate-500">
                {k.sub}
              </span>
            ) : (
              <span className="h-[9px]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
