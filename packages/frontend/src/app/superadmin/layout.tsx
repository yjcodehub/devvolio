'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import SuperAdminGuard from '@/components/admin/SuperAdminGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';
import DevvolioLogo from '@/components/layout/DevvolioLogo';
import { 
  TrendingUp, Globe, CreditCard, LayoutTemplate, Layers, Lock, 
  LogOut, ArrowLeft, Crown, ShieldAlert
} from 'lucide-react';

const SUPER_ADMIN_NAV = [
  { label: 'Overall Dashboard', href: '/superadmin', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
  { label: 'Workspaces Directory', href: '/superadmin/workspaces', icon: <Globe className="w-4 h-4 text-primary" /> },
  { label: 'Payment Governance', href: '/superadmin/payments', icon: <CreditCard className="w-4 h-4 text-amber-400" /> },
  { label: 'Template Studio', href: '/superadmin/templates', icon: <LayoutTemplate className="w-4 h-4 text-cyan-400" /> },
  { label: 'Departments & Roles', href: '/superadmin/departments', icon: <Layers className="w-4 h-4 text-purple-400" /> },
  { label: 'Subscription RBAC', href: '/superadmin/rbac', icon: <Lock className="w-4 h-4 text-rose-400" /> },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success('Super Admin session terminated');
        clearAuth();
        router.replace('/admin');
      }
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <SuperAdminGuard>
      <div className="flex min-h-screen bg-background text-foreground font-sans">
        {/* Dedicated Super Admin Sidebar */}
        <aside className="w-64 border-r border-amber-500/20 bg-card/25 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
          <div>
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <DevvolioLogo iconSize={26} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                <Crown className="w-3 h-3 text-amber-400" />
                Super Admin Platform
              </div>
            </div>

            <nav className="space-y-1.5 text-left">
              {SUPER_ADMIN_NAV.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-md shadow-amber-500/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2 pt-4 border-t border-border/50">
            <Link
              href="/admin/dashboard"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tenant Admin View</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Term Session</span>
            </button>
          </div>
        </aside>

        {/* Super Admin Content Viewport */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <main className="flex-grow p-8 bg-background/50">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  );
}
