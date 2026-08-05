'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';
import DevvolioLogo from '@/components/layout/DevvolioLogo';
import { 
  LayoutDashboard, FolderKanban, CalendarRange, Wrench, 
  MessageSquareDot, LogOut, FileText, Settings, Sliders, 
  CreditCard, Crown, ArrowRight 
} from 'lucide-react';

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Projects', href: '/admin/projects', icon: <FolderKanban className="w-4 h-4" /> },
  { label: 'Experience', href: '/admin/experience', icon: <CalendarRange className="w-4 h-4" /> },
  { label: 'Skills', href: '/admin/skills', icon: <Wrench className="w-4 h-4" /> },
  { label: 'Resumes', href: '/admin/resumes', icon: <FileText className="w-4 h-4" /> },
  { label: 'Messages', href: '/admin/messages', icon: <MessageSquareDot className="w-4 h-4" /> },
  { label: 'Page Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  { label: 'Section Visibility', href: '/admin/visibility', icon: <Sliders className="w-4 h-4" /> },
  { label: 'Billing & Plan', href: '/admin/billing', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const isLoginPage = pathname === '/admin';
  const isSuperAdmin = user?.role === 'super_admin' || user?.email === 'lakshraj2121@gmail.com';

  const handleLogout = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success('Session terminated successfully');
        clearAuth();
        router.replace('/admin');
      } else {
        throw new Error('API logout error');
      }
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  if (isLoginPage) {
    return <AdminGuard>{children}</AdminGuard>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background text-foreground font-sans">
        {/* Sidebar Nav panel */}
        <aside className="w-64 border-r border-border bg-card/15 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
          <div>
            <div className="mb-8">
              <DevvolioLogo iconSize={26} />
            </div>

            <nav className="space-y-1.5 text-left">
              {ADMIN_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover-glow-trigger ${
                      isActive
                        ? 'bg-primary text-white'
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

          <div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all hover-glow-trigger"
            >
              <LogOut className="w-4 h-4" />
              <span>Term Session</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Viewport */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Top Header Bar */}
          <header className="px-8 py-3.5 border-b border-border/40 bg-card/10 flex justify-between items-center shrink-0">
            <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Workspace Admin Context</span>
            </div>

            {/* Exclusive Super Admin Portal Switcher Button */}
            {isSuperAdmin && (
              <Link
                href="/superadmin"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-md shadow-amber-500/5 hover:scale-105"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Launch Super Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </header>

          <main className="flex-grow p-8 bg-background/50">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
