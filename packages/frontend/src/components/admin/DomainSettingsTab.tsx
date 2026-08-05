'use client';

import React, { useState } from 'react';
import { Globe, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Copy, Check, ShieldCheck } from 'lucide-react';
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

          <div className="flex items-center gap-2">
            <a
              href={defaultSubdomainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/40 text-xs font-semibold text-foreground transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test Local Subdomain
            </a>
          </div>
        </div>
      </div>

      {/* Custom Domain Settings & DNS Verification Panel */}
      <div className="rounded-xl border border-border bg-card/30 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Custom Domain Mapping</h2>
              <p className="text-xs text-muted-foreground">Connect your own domain (e.g. john.dev, alexname.com)</p>
            </div>
          </div>

          {customDomain && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              domainStatus === 'active'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {domainStatus === 'active' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Domain Active & SSL Secured
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  DNS Verification Pending
                </>
              )}
            </span>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveDomain} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Your Custom Domain
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. john.dev or alexname.com"
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card/60 text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-semibold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Connect Domain'}
              </button>
            </div>
          </div>
        </form>

        {/* DNS Instructions & Live Verifier */}
        {customDomain && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">DNS Record Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* CNAME Instruction */}
              <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">CNAME Record</span>
                  <button
                    onClick={() => copyToClipboard('cname.devvolio.in', 'CNAME')}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                  >
                    {copiedField === 'CNAME' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-1 font-mono">
                  <p>Type: <span className="text-foreground font-bold">CNAME</span></p>
                  <p>Host/Name: <span className="text-foreground font-bold">@ or www</span></p>
                  <p>Target/Value: <span className="text-primary font-bold">cname.devvolio.in</span></p>
                </div>
              </div>

              {/* TXT Verification Record */}
              <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">TXT Verification Record</span>
                  <button
                    onClick={() => copyToClipboard(`devvolio-verify-${customDomain}`, 'TXT')}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                  >
                    {copiedField === 'TXT' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-1 font-mono">
                  <p>Type: <span className="text-foreground font-bold">TXT</span></p>
                  <p>Host: <span className="text-foreground font-bold">_devvolio-verify.{customDomain}</span></p>
                  <p>Value: <span className="text-primary font-bold">devvolio-verify-{customDomain}</span></p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleVerifyDns}
                disabled={verifying}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                {verifying ? 'Checking DNS Propagation...' : 'Verify DNS Records'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
