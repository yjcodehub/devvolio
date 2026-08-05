'use client';

import React from 'react';
import { CreditCard, CheckCircle2, RefreshCw, DollarSign, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentsGovernancePage() {
  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-amber-400" />
            Payment Modification & Gateway Overrides
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Super Admin transaction logs, Razorpay/Stripe webhook events, manual invoice adjustments, and refund controls.
          </p>
        </div>

        <button
          onClick={() => toast.success('Payment transaction logs synced')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Transactions
        </button>
      </div>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-sm">Razorpay INR Gateway (India)</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Operational (Test/Live)
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Primary payment gateway for INR (UPI, Debit/Credit Cards, NetBanking, and Auto-debit).
          </p>
          <div className="pt-2 text-xs font-mono text-muted-foreground">
            Key ID: <span className="text-foreground">rzp_test_...</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-sm">Stripe International Gateway (Global USD)</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground px-2.5 py-1 rounded-full bg-muted/40 border border-border">
              Configured
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Global payment gateway for international subscribers paying in USD/EUR.
          </p>
          <div className="pt-2 text-xs font-mono text-muted-foreground">
            Webhook Secret: <span className="text-foreground">whsec_...</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card/30 space-y-4 text-center py-12">
        <DollarSign className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
        <h3 className="text-sm font-bold text-foreground">Razorpay & Stripe Transaction Logs</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          All automated subscription charges and webhooks are logged dynamically in real-time. Manual payment overrides can be granted to any workspace via the Workspaces Directory.
        </p>
      </div>
    </div>
  );
}
