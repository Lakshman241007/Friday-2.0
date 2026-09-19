import React, { useState } from 'react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials } from '../auth.types';
import { APP_NAME } from '@/lib/constants';
import { Sparkles, Radio } from 'lucide-react';

export interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login, isLoading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginCredentials) => {
    setLocalError(null);
    try {
      await login(credentials);
      if (onSuccess) {
        onSuccess();
      } else if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Subtle Galaxy Background */}
      <GalaxyBackground enableShootingStars={true} />

      {/* Foreground Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#0d0d14]/80 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase font-medium">
              Autonomous Sales Core
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white flex items-center justify-center gap-2.5">
              <span>{APP_NAME}</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Real-time voice intelligence & automated outbound sales execution
            </p>
          </div>
        </div>

        {/* Auth Panel */}
        <div className="w-full rounded-2xl border border-white/[0.09] bg-[#0c0c11]/85 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
                Secure Console Access
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select your role to explore the active workspace
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
              <Radio className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={localError || error}
          />
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-slate-600" />
            Enterprise Authentication Core
          </span>
          <span>•</span>
          <span>v1.0.0-rc</span>
          <span>•</span>
          <span className="text-emerald-500/80">Status: Nominal</span>
        </div>
      </div>
    </div>
  );
};
