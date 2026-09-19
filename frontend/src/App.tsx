import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteRegistry } from '@/routes';
import { DEFAULT_ROUTE } from '@/lib/constants';

function AppShell({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const { isAuthenticated } = useAuth();
  const normalizedPath = currentPath === '/' ? DEFAULT_ROUTE : currentPath;
  const isStandalone = !isAuthenticated || normalizedPath === '/login' || normalizedPath === '/unauthorized';

  if (isStandalone) {
    return <RouteRegistry currentPath={currentPath} />;
  }

  return (
    <AppLayout activePath={currentPath} onNavigate={onNavigate}>
      <RouteRegistry currentPath={currentPath} />
    </AppLayout>
  );
}

export default function App() {
  // Sync router with browser hash or location path
  const getInitialPath = (): string => {
    if (typeof window === 'undefined') return DEFAULT_ROUTE;
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && hash.startsWith('/')) {
      return hash;
    }
    return window.location.pathname !== '/' ? window.location.pathname : DEFAULT_ROUTE;
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash.startsWith('/')) {
        setCurrentPath(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.location.hash = path;
    }
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell currentPath={currentPath} onNavigate={handleNavigate} />
      </ToastProvider>
    </AuthProvider>
  );
}
