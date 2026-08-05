'use client';

import React, { useEffect, useState } from 'react';
import { 
  Globe, Search, RefreshCw, Loader2, UserCheck, Power, Crown
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

export default function WorkspacesGovernancePage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const apiUrl = getApiUrl();

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/super-admin/workspaces`, { credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.success) {
        setWorkspaces(json.data);
      }
    } catch (err: any) {
      toast.error('Failed to load workspaces directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
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
      fetchWorkspaces();
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
      fetchWorkspaces();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update workspace plan');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleImpersonate = async (id: string, slug: string) => {
    try {
      const res = await fetch(`${apiUrl}/super-admin/workspaces/${id}/impersonate`, {
        method: 'POST',
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Impersonation failed');

      toast.success(`Super Admin Context active for workspace [${slug}]`);
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
        <p className="text-sm font-semibold text-muted-foreground">Loading Workspaces Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="w-7 h-7 text-primary" />
            Workspaces Directory & Impersonation
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Governance directory of all SaaS workspaces, plan overrides, and 1-click tenant impersonation.
          </p>
        </div>

        <button
          onClick={fetchWorkspaces}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card/60 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Directory
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card/30 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, subdomain, email..."
              className="px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs text-foreground focus:outline-none focus:border-primary w-64"
            />
          </div>

          <div className="flex items-center gap-3">
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
                      onClick={() => handleImpersonate(ws.id, ws.slug)}
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
