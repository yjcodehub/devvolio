'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast.error('Session expired. Please log in.');
        router.replace('/admin');
      } else if (user?.role !== 'super_admin' && user?.email !== 'lakshraj2121@gmail.com') {
        toast.error('Access Denied: Super Admin authorization required.');
        router.replace('/admin/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Verifying Platform Super Admin Security Token...</p>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'super_admin' && user?.email !== 'lakshraj2121@gmail.com')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center gap-3">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold font-display">Super Admin Portal Access Restricted</h1>
        <p className="text-xs text-muted-foreground max-w-sm">
          You must be logged in as Super Admin (lakshraj2121@gmail.com) to access the platform governance portal.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
