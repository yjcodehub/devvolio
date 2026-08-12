import React, { useState } from 'react';
import { Globe, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Copy, Check, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

interface DomainSettingsTabProps {
  subdomain?: string;
  customDomain?: string;
  domainStatus?: 'pending' | 'active' | 'failed';
  onUpdated: () => void;
}

export default function DomainSettingsTab({
  subdomain = 'yash',
  customDomain = '',
  domainStatus = 'pending',
  onUpdated
}: DomainSettingsTabProps) {
  const [domainInput, setDomainInput] = useState(customDomain);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const apiUrl = getApiUrl();
  const defaultSubdomainUrl = `http://${subdomain}.lvh.me:3000`;
  const prodSubdomainUrl = `https://${subdomain}.devvolio.in`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) {
      toast.error('Please enter a domain name');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/workspace/custom-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput.trim() }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to register domain');

      toast.success('Custom domain registered. Please configure DNS records.');
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDns = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${apiUrl}/workspace/verify-domain`, {
        method: 'POST',
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'DNS verification failed');

      if (json.data?.isVerified) {
        toast.success('DNS Verified! Your domain is now active.');
      } else {
        toast.warning('DNS propagation pending. Please double-check CNAME/TXT records.');
      }
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Verification check failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      {/* Primary Platform Subdomain Panel */}
      <div className="rounded-xl border border-border bg-card/30 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Platform Free Subdomain</h2>
            <p className="text-xs text-muted-foreground">Every portfolio automatically receives an active subdomain</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Production URL</span>
            <code className="text-sm font-bold text-primary font-mono">{prodSubdomainUrl}</code>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={prodSubdomainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md shadow-primary/20 hover:scale-105"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Production Subdomain
            </a>

            <a
              href={defaultSubdomainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test Local Subdomain
            </a>
          </div>
        </div>
      </div>

      {/* Custom Domain Settings & Skeleton Placeholder Panel */}
      <div className="rounded-xl border border-border/80 bg-card/30 p-6 space-y-6 relative overflow-hidden">
        {/* Header Title with Coming Soon Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Custom Domain Mapping</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-3 h-3" /> Coming Soon
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Connect your own custom domain (e.g. john.dev, alexname.com) with automated SSL</p>
            </div>
          </div>
        </div>

        {/* Skeleton Preview Overlay */}
        <div className="p-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 space-y-6 relative">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Domain Configuration (Pro Feature)</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Custom Domains Module Launching Soon
              </span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                disabled
                placeholder="e.g. john.dev or alexname.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 bg-card/40 text-xs text-muted-foreground cursor-not-allowed font-mono"
              />
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed opacity-60"
              >
                Connect Domain
              </button>
            </div>
          </div>

          {/* Skeleton DNS Card Previews */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">DNS Verification Preview</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/40 bg-card/20 space-y-2 animate-pulse">
                <div className="h-3 w-28 bg-muted/60 rounded" />
                <div className="h-2.5 w-40 bg-muted/40 rounded" />
                <div className="h-2.5 w-36 bg-muted/40 rounded" />
              </div>
              <div className="p-4 rounded-xl border border-border/40 bg-card/20 space-y-2 animate-pulse">
                <div className="h-3 w-32 bg-muted/60 rounded" />
                <div className="h-2.5 w-44 bg-muted/40 rounded" />
                <div className="h-2.5 w-40 bg-muted/40 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
