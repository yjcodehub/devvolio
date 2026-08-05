'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Globe, CreditCard, LayoutTemplate, Layers, Lock, 
  RefreshCw, Loader2, ArrowUpRight, Crown, Zap, ShieldAlert 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = getApiUrl();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/super-admin/analytics`, { credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.success) {
        setAnalytics(json.data);
      }
    } catch (err) {
      toast.error('Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Retrieving SaaS Platform Revenue & Tenant Analytics...</p>
      </div>
    );
  }

  const rev = analytics?.revenue || {};
  const wsStats = analytics?.workspaces || {};

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Crown className="w-7 h-7 text-amber-400" />
            Overall Platform Dashboard
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Global SaaS revenue run-rate, tenant conversions, template management, and subscription RBAC.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Realtime Analytics
        </button>
      </div>

      {/* Revenue Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Monthly Recurring Revenue (MRR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display text-3xl font-extrabold text-foreground">
            ₹{(rev.mrrInr || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-muted-foreground">ARR Run-Rate: ₹{(rev.arrInr || 0).toLocaleString('en-IN')}/yr</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Total SaaS Workspaces</span>
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display text-3xl font-extrabold text-foreground">
            {wsStats.total || 0}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold">{wsStats.active || 0} Active • {wsStats.suspended || 0} Suspended</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Paid Subscription Rate</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-display text-3xl font-extrabold text-foreground">
            {rev.paidConversionRate || 0}%
          </p>
          <p className="text-[10px] text-muted-foreground">{wsStats.pro || 0} Pro • {wsStats.enterprise || 0} Enterprise</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Global AI Engine Requests</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display text-3xl font-extrabold text-foreground">
            {analytics?.usage?.totalAiGenerations || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">{analytics?.usage?.totalProjects || 0} Total Projects</p>
        </div>
      </div>

      {/* Super Admin Control Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Super Admin Platform Control Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workspaces Module */}
          <Link
            href="/superadmin/workspaces"
            className="p-6 rounded-2xl border border-border bg-card/30 hover:border-primary/50 hover:bg-card/50 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Globe className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Workspaces Directory & Impersonation</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Manage all tenant workspaces, suspend abuse, override plans, and 1-click impersonate.
              </p>
            </div>
          </Link>

          {/* Payment Governance Module */}
          <Link
            href="/superadmin/payments"
            className="p-6 rounded-2xl border border-border bg-card/30 hover:border-amber-500/50 hover:bg-card/50 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-400 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Payment Modification & Razorpay Overrides</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Inspect Razorpay & Stripe transaction logs, manual invoice overrides, and refund management.
              </p>
            </div>
          </Link>

          {/* Template Studio Module */}
          <Link
            href="/superadmin/templates"
            className="p-6 rounded-2xl border border-border bg-card/30 hover:border-cyan-500/50 hover:bg-card/50 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Template Creation Studio</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Build portfolio layout templates for Developers, Designers, UI/UX, and Marketing.
              </p>
            </div>
          </Link>

          {/* Departments & Roles Module */}
          <Link
            href="/superadmin/departments"
            className="p-6 rounded-2xl border border-border bg-card/30 hover:border-purple-500/50 hover:bg-card/50 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Departments & Category Switcher</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Configure department categories (Developer, UI/UX, Marketing, PM) and preset skills.
              </p>
            </div>
          </Link>

          {/* Subscription RBAC Module */}
          <Link
            href="/superadmin/rbac"
            className="p-6 rounded-2xl border border-border bg-card/30 hover:border-rose-500/50 hover:bg-card/50 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Lock className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-rose-400 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Subscription RBAC & Feature Flags</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Define role-based access rules and feature flags bound to subscription plans.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
