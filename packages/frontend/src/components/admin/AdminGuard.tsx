'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    // Skip verification check if we are on the base login page itself
    if (pathname === '/admin') return;

    const verifySession = async () => {
      try {
        const apiUrl = getApiUrl();
        // Credentials required to transmit HttpOnly JWT session cookies automatically
        const res = await fetch(`${apiUrl}/auth/me`, { credentials: 'include' });
        
        if (!res.ok) throw new Error('Unauthorized');
        
        const json = await res.json();
        if (json.success) {
          setUser(json.data);
        } else {
          throw new Error('Verification failed');
        }
      } catch (err) {
        clearAuth();
        router.replace('/admin');
      }
    };

    verifySession();
  }, [pathname, router, setUser, clearAuth]);

  // Loading state overlay (displayed while session verification is active)
  if (loading && pathname !== '/admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground">Verifying secure admin session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
