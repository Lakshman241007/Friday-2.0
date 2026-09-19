import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';

export interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  onNavigate?: (path: string) => void;
  reducedMotionOverride?: boolean;
  enableShootingStars?: boolean;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activePath = '/dashboard',
  onNavigate,
  reducedMotionOverride,
  enableShootingStars = true,
  className,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen relative flex bg-[#050507] text-[#f8fafc] font-sans antialiased selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* Living Galaxy Atmosphere (Behind all UI, pointer-events-none) */}
      <GalaxyBackground
        reducedMotionOverride={reducedMotionOverride}
        enableShootingStars={enableShootingStars}
      />

      {/* Foreground Application Layer */}
      <div className="relative z-10 flex w-full min-h-screen">
        {/* Persistent Desktop Sidebar */}
        <Sidebar
          className="hidden md:flex sticky top-0 h-screen"
          activePath={activePath}
          onNavigate={onNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          activePath={activePath}
          onNavigate={onNavigate}
        />

        {/* Main Application Area (Topbar + Content) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Topbar
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Page Content Container with Subtle Page Transition */}
          <main
            id="friday-main-content"
            tabIndex={-1}
            className={cn('flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8', className)}
          >
            <div
              key={activePath}
              className="animate-in fade-in duration-200 slide-in-from-bottom-1 motion-reduce:animate-none"
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
