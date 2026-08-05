'use client';

import React from 'react';
import { Lock, Shield, Check, X, Sliders } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionRbacPage() {
  const rbacRules = [
    {
      feature: 'Max Featured Projects',
      free: '5 Projects',
      pro: 'Unlimited',
      enterprise: 'Unlimited'
    },
    {
      feature: 'Custom Domain Mapping (john.dev)',
      free: false,
      pro: true,
      enterprise: true
    },
    {
      feature: 'Monthly AI Content Quota',
      free: '5 / month',
      pro: '500 / month',
      enterprise: '5,000 / month'
    },
    {
      feature: 'AI Resume Auto-Importer',
      free: false,
      pro: true,
      enterprise: true
    },
    {
      feature: 'White-label Custom Branding',
      free: false,
      pro: false,
      enterprise: true
    },
    {
      feature: 'Dedicated DB Instance & SLA',
      free: false,
      pro: false,
      enterprise: true
    }
  ];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Lock className="w-7 h-7 text-rose-400" />
            Subscription RBAC & Feature Flags Matrix
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Configure permission boundaries, feature flags, and API rate-limits per subscription tier.
          </p>
        </div>

        <button
          onClick={() => toast.success('RBAC matrix rules synced')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
        >
          <Sliders className="w-4 h-4" />
          Save RBAC Matrix
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card/30 overflow-hidden shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/15 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3.5">Platform Feature / Capability</th>
                <th className="px-4 py-3.5 text-center">FREE (₹0)</th>
                <th className="px-4 py-3.5 text-center text-primary font-extrabold">PRO (₹999/mo)</th>
                <th className="px-4 py-3.5 text-center text-amber-400 font-extrabold">ENTERPRISE (₹2,999/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {rbacRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-card/20 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-foreground">{rule.feature}</td>
                  
                  {/* Free */}
                  <td className="px-4 py-3.5 text-center">
                    {typeof rule.free === 'boolean' ? (
                      rule.free ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">{rule.free}</span>
                    )}
                  </td>

                  {/* Pro */}
                  <td className="px-4 py-3.5 text-center bg-primary/5 font-bold">
                    {typeof rule.pro === 'boolean' ? (
                      rule.pro ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-primary font-bold">{rule.pro}</span>
                    )}
                  </td>

                  {/* Enterprise */}
                  <td className="px-4 py-3.5 text-center">
                    {typeof rule.enterprise === 'boolean' ? (
                      rule.enterprise ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-amber-400 font-bold">{rule.enterprise}</span>
                    )}
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
