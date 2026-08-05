'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, TrendingUp, Users, Globe, Zap, Search, Filter, 
  ExternalLink, UserCheck, Power, RefreshCw, Loader2, ArrowUpRight, Crown, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'canceled';
  plan: 'free' | 'pro' | 'enterprise';
  customDomain?: string;
  domainStatus?: string;
  owner?: { name: string; email: string; role: string } | null;
  createdAt: string;
}

export default function SuperAdminPanel() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const apiUrl = getApiUrl();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, wsRes] = await Promise.all([
        fetch(`${apiUrl}/super-admin/analytics`, { credentials: 'include' }),
        fetch(`${apiUrl}/super-admin/workspaces`, { credentials: 'include' })
      ]);

      const analyticsJson = await analyticsRes.json();
      const wsJson = await wsRes.json();

      if (analyticsRes.ok && analyticsJson.success) {
        setAnalytics(analyticsJson.data);
      }
      if (wsRes.ok && wsJson.success) {
        setWorkspaces(wsJson.data);
      }
    } catch (err: any) {
      toast.error('Failed to load Super Admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change workspace "${name}" status to ${newStatus.toUpperCase()}?`)) return;

    setActionLoadingId(id);
    try {
      const res = await fetch(`${apiUrl}/super-admin/workspaces/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Status update failed');

      toast.success(`Workspace "${name}" status set to ${newStatus.toUpperCase()}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update workspace status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdatePlan = async (id: string, newPlan: string, name: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${apiUrl}/super-admin/workspaces/${id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Plan update failed');

      toast.success(`Workspace "${name}" plan upgraded to ${newPlan.toUpperCase()}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update workspace plan');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleImpersonate = async (id: string, name: string, slug: string) => {
    try {
      const res = await fetch(`${apiUrl}/super-admin/workspaces/${id}/impersonate`, {
        method: 'POST',
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Impersonation failed');

      toast.success(`Active Super Admin Context set to workspace [${slug}]`);
      window.open(`http://${slug}.lvh.me:3000`, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Impersonation failed');
    }
  };

  const filteredWorkspaces = workspaces.filter(ws => {
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ws.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ws.owner?.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || ws.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || ws.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Calculating Platform Revenue & Workspace Governance...</p>
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
            <ShieldAlert className="w-7 h-7 text-primary" />
            Super Admin Control Panel
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Platform governance, INR revenue analytics, tenant workspace suspension, and plan overrides.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Governance
        </button>
      </div>

      {/* Revenue & Growth Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Card */}
        <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Monthly Recurring Revenue (MRR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display text-2xl font-extrabold text-foreground">
            ₹{(rev.mrrInr || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-muted-foreground">ARR Run-Rate: ₹{(rev.arrInr || 0).toLocaleString('en-IN')}/yr</p>
        </div>

        {/* Total Tenants Card */}
        <div className="p-5 rounded-2xl border border-border bg-card/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Total Workspaces</span>
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display text-2xl font-extrabold text-foreground">
            {wsStats.total || 0}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold">{wsStats.active || 0} Active • {wsStats.suspended || 0} Suspended</p>
        </div>

        {/* Paid Conversion Rate */}
        <div className="p-5 rounded-2xl border border-border bg-card/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Paid Conversion</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-display text-2xl font-extrabold text-foreground">
            {rev.paidConversionRate || 0}%
          </p>
          <p className="text-[10px] text-muted-foreground">{wsStats.pro || 0} Pro • {wsStats.enterprise || 0} Enterprise</p>
        </div>

        {/* Global AI Requests */}
        <div className="p-5 rounded-2xl border border-border bg-card/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Global AI Generations</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display text-2xl font-extrabold text-foreground">
            {analytics?.usage?.totalAiGenerations || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">{analytics?.usage?.totalProjects || 0} Total Portfolio Projects</p>
        </div>
      </div>

      {/* Tenant Governance Table & Filters */}
      <div className="rounded-xl border border-border bg-card/30 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-foreground">Tenant Workspaces Directory</h2>

          {/* Search & Filter Inputs */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, slug, email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/15 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Workspace</th>
                <th className="px-4 py-3">Owner Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredWorkspaces.map((ws) => (
                <tr key={ws.id} className="hover:bg-card/20 transition-colors">
                  <td className="px-4 py-3 space-y-0.5">
                    <div className="font-bold text-foreground">{ws.name}</div>
                    <div className="font-mono text-[10px] text-primary">{ws.slug}.devvolio.in</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ws.owner?.email || 'System Default'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ws.plan}
                      onChange={(e) => handleUpdatePlan(ws.id, e.target.value, ws.name)}
                      disabled={actionLoadingId === ws.id}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase border focus:outline-none ${
                        ws.plan === 'pro'
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : ws.plan === 'enterprise'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-muted/40 text-muted-foreground border-border'
                      }`}
                    >
                      <option value="free">FREE</option>
                      <option value="pro">PRO</option>
                      <option value="enterprise">ENTERPRISE</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      ws.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {ws.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleImpersonate(ws.id, ws.name, ws.slug)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-[10px] font-bold text-foreground hover:bg-muted/40 transition-all"
                    >
                      <UserCheck className="w-3 h-3 text-primary" />
                      Impersonate
                    </button>

                    <button
                      onClick={() => handleToggleStatus(ws.id, ws.status, ws.name)}
                      disabled={actionLoadingId === ws.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        ws.status === 'active'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {ws.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
