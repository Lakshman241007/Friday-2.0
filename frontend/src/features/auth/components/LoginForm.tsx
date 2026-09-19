import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RoleSelector } from './RoleSelector';
import { UserRole, LoginCredentials } from '../auth.types';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  defaultRole?: UserRole;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  defaultRole = 'manager',
  isLoading = false,
  error: externalError = null,
  className,
}) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState(
    defaultRole === 'manager' ? 'lakshmanmukesh7@gmail.com' : 'elena.rostova@friday.ai'
  );
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'manager') {
      setEmail('lakshmanmukesh7@gmail.com');
    } else {
      setEmail('elena.rostova@friday.ai');
    }
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid work email address';
    }
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit({
        email: email.trim(),
        password,
        role,
      });
    } catch {
      // External error will be displayed
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('space-y-4 text-left w-full', className)}
    >
      {/* Role Selector */}
      <RoleSelector
        selectedRole={role}
        onChange={handleRoleChange}
        disabled={isLoading}
      />

      {/* External Error Message Banner */}
      {externalError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-500/25 text-rose-300 text-xs animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{externalError}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1">
        <Input
          id="auth-email-input"
          label="Corporate Email"
          type="email"
          autoComplete="email"
          disabled={isLoading}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="agent@friday.ai"
          leftIcon={<Mail className="w-4 h-4" />}
          error={fieldErrors.email}
        />
      </div>

      {/* Password Input */}
      <div className="space-y-1">
        <Input
          id="auth-password-input"
          label="Access Key / Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          disabled={isLoading}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none pointer-events-auto"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={fieldErrors.password}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full justify-center text-sm font-semibold tracking-wide shadow-sm"
          isLoading={isLoading}
          rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
        >
          {isLoading ? 'Verifying Credentials...' : `Enter as ${role === 'manager' ? 'Manager' : 'Employee'}`}
        </Button>
      </div>

      {/* Security Note */}
      <p className="text-[11px] font-mono text-slate-500 text-center pt-2">
        Protected by FRIDAY Sentinel Cryptographic Verification
      </p>
    </form>
  );
};
