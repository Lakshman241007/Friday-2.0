import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  X,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { APP_NAME, NAVIGATION_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { phase4Store } from '@/features/leads/leads.data';
import { alertsStore } from '@/features/alerts/alerts.api';
import { Alert } from '@/features/alerts/alerts.types';

export interface TopbarProps {
  onOpenMobileNav?: () => void;
  className?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileNav,
  className,
}) => {
  const { user, role, switchRole, logout } = useAuth();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification panel state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(() => alertsStore.getAll());
  const notifRef = useRef<HTMLDivElement>(null);

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Subscribe to alerts store
  useEffect(() => {
    const unsubscribe = alertsStore.subscribe(() => {
      setAlerts(alertsStore.getAll());
    });
    return unsubscribe;
  }, []);

  const unreadAlerts = alerts.filter((a) => a.status === 'unread');
  const unreadCount = unreadAlerts.length;

  // Search results query
  const q = searchQuery.trim().toLowerCase();
  const matchedPages = q
    ? NAVIGATION_ITEMS.filter(
        (item) =>
          (!item.roles || item.roles.includes(role || 'manager')) &&
          (item.label.toLowerCase().includes(q) || item.path.toLowerCase().includes(q))
      ).slice(0, 3)
    : [];

  const matchedLeads = q
    ? phase4Store
        .getLeads()
        .filter(
          (lead) =>
            lead.name.toLowerCase().includes(q) ||
            lead.company.toLowerCase().includes(q) ||
            lead.email.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchedCalls = q
    ? phase4Store
        .getCallHistory()
        .filter(
          (c) =>
            c.leadName.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const hasSearchResults =
    q.length > 0 &&
    (matchedPages.length > 0 || matchedLeads.length > 0 || matchedCalls.length > 0);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global shortcut ⌘K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigateTo = (hashPath: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    window.location.hash = hashPath;
  };

  return (
    <header
      id="friday-topbar"
      role="banner"
      className={cn(
        'h-14 w-full border-b border-white/[0.08] bg-[#07070a]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-3',
        className
      )}
    >
      {/* Left: Mobile Drawer Trigger & Brand Indicator */}
      <div className="flex items-center gap-3 shrink-0">
        {onOpenMobileNav && (
          <button
            type="button"
            id="mobile-nav-toggle"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/25"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-white font-mono hidden xs:inline-block">
            {APP_NAME}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.07]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workspace Ready</span>
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar with Live Result Dropdown */}
      <div className="flex-1 max-w-md mx-auto hidden sm:block relative" ref={searchContainerRef}>
        <div
          className={cn(
            'relative flex items-center w-full h-8.5 px-2.5 rounded-lg bg-[#0b0b10] border border-white/[0.08] transition-all duration-150',
            isSearchFocused
              ? 'border-white/25 bg-[#0f0f16] ring-1 ring-white/10'
              : 'hover:border-white/15'
          )}
        >
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-2" />
          <input
            ref={searchInputRef}
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search workspace, leads, calls..."
            aria-label="Search workspace"
            className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="p-0.5 text-slate-500 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-white/[0.04] border border-white/10 rounded">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && q.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#0c0c12] border border-white/12 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto space-y-2">
            {!hasSearchResults && (
              <div className="p-3 text-center text-xs text-slate-400 font-mono">
                No matching leads, calls, or pages located.
              </div>
            )}

            {matchedPages.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Navigation Pages
                </div>
                {matchedPages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleNavigateTo(page.path)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      <span>{page.label}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            )}

            {matchedLeads.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Prospects & Leads
                </div>
                {matchedLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => handleNavigateTo(`/leads/${lead.id}`)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-medium text-white truncate">{lead.name}</span>
                      <span className="text-[11px] text-slate-400 truncate">({lead.company})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">#{lead.id}</span>
                  </button>
                ))}
              </div>
            )}

            {matchedCalls.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Call Records & Dialogues
                </div>
                {matchedCalls.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleNavigateTo(`/calling/${c.id}`)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white truncate">{c.leadName}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{c.duration}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">#{c.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & Profile Foundation */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Galaxy Environment Indicator */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] text-slate-500 font-mono">
          <Sparkles className="w-3 h-3 text-slate-400" />
          <span>Atmosphere</span>
        </div>

        <div className="h-4 w-px bg-white/[0.08] hidden lg:block" />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            id="notification-trigger"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
            className={cn(
              'relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-white/25',
              isNotifOpen && 'text-white bg-white/[0.08]'
            )}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 rounded-full bg-sky-500 text-zinc-950 font-mono text-[9px] font-bold ring-2 ring-[#07070a]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {isNotifOpen && (
            <div
              id="notification-panel"
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0c0c12] border border-white/12 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Operational Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => alertsStore.markAllRead()}
                    className="text-[10px] font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    All alerts resolved
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                    Telemetry streams nominal. No attention items required.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        alertsStore.markRead(alert.id);
                        setIsNotifOpen(false);
                        window.location.hash = alert.actionUrl || '#/alerts';
                      }}
                      className={cn(
                        'p-2.5 rounded-lg border text-left cursor-pointer transition-colors space-y-1',
                        alert.status === 'unread'
                          ? 'bg-white/[0.04] border-white/10 hover:border-white/20'
                          : 'bg-transparent border-white/5 opacity-70 hover:opacity-100'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {alert.title}
                        </span>
                        <span
                          className={cn(
                            'text-[9px] font-mono uppercase px-1 rounded',
                            alert.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300'
                              : alert.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-sky-500/20 text-sky-300'
                          )}
                        >
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                        <span>{alert.leadName || alert.company || 'System'}</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    window.location.hash = '#/alerts';
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open Attention Feed</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Foundation */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            id="profile-dropdown-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="User profile menu"
            aria-expanded={isProfileOpen}
            className={cn(
              'flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all outline-none focus-visible:ring-1 focus-visible:ring-white/25',
              isProfileOpen && 'bg-white/[0.08] text-white'
            )}
          >
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-semibold text-white font-mono shadow-xs">
              {user?.initials || 'LM'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                {user?.name || 'Lakshman M.'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase leading-none">
                {user?.role || 'Manager'}
              </div>
            </div>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-slate-500 transition-transform duration-150',
                isProfileOpen && 'rotate-180 text-slate-300'
              )}
            />
          </button>

          {/* Profile Dropdown Foundation */}
          {isProfileOpen && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0c0c12] border border-white/12 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                <p className="text-xs font-medium text-slate-200">{user?.name}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  switchRole(role === 'manager' ? 'employee' : 'manager');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Switch to {role === 'manager' ? 'Employee' : 'Manager'}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Demo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Workspace Preferences</span>
              </button>

              <div className="h-px bg-white/[0.06] my-1" />

              <button
                type="button"
                onClick={async () => {
                  setIsProfileOpen(false);
                  await logout();
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#/login';
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
