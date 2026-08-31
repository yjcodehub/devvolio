'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl, getAuthHeaders } from '@/utils/api';

const isSuperAdminUser = (user: { role?: string; email?: string } | null): boolean => {
  if (!user) return false;
  return user.role === 'super_admin' || user.role === 'superAdmin' || user.email === 'yash@devvolio.in';
};

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, setUser, clearAuth } = useAuthStore();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySuperAdminSession = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const json = await res.json();
        if (json.success && json.data) {
          if (!isMounted) return;
          setUser(json.data);

          if (!isSuperAdminUser(json.data)) {
            toast.error('Access Denied: Super Admin authorization required.');
            router.replace('/admin/dashboard');
            return;
          }
        } else {
          throw new Error('Verification failed');
        }
      } catch (err) {
        if (!isMounted) return;
        if (!isSuperAdminUser(user)) {
          clearAuth();
          toast.error('Session expired or unauthorized. Please log in.');
          router.replace('/admin');
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    verifySuperAdminSession();

    return () => {
      isMounted = false;
    };
  }, [router, setUser, clearAuth]);

  const isSuper = isSuperAdminUser(user);

  if (verifying && !isSuper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Verifying Platform Super Admin Security Token...</p>
      </div>
    );
  }

  if (!isSuper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center gap-3">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold font-display">Super Admin Portal Access Restricted</h1>
        <p className="text-xs text-muted-foreground max-w-sm">
          You must be logged in as Super Admin (yash@devvolio.in) to access the platform governance portal.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
