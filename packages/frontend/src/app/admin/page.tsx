'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { getApiUrl } from '@/utils/api';
import { Loader2 } from 'lucide-react';

export default function AdminRootRedirect() {
  const router = useRouter();
  const { setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUser(json.data);
            if (json.data.role === 'super_admin' || json.data.email === 'lakshraj2121@gmail.com') {
              router.replace('/superadmin');
            } else {
              router.replace('/admin/dashboard');
            }
            return;
          }
        }
        clearAuth();
        router.replace('/login');
      } catch (err) {
        clearAuth();
        router.replace('/login');
      }
    };
    checkSession();
  }, [router, setUser, clearAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm font-semibold text-muted-foreground">Redirecting to Dashboard...</p>
    </div>
  );
}
