'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Sparkles, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

export default function BillingAdmin() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const apiUrl = getApiUrl();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch(`${apiUrl}/billing/plans`),
        fetch(`${apiUrl}/billing/subscription`, { credentials: 'include' })
      ]);

      const plansJson = await plansRes.json();
      const subJson = await subRes.json();

      if (plansRes.ok && plansJson.success) {
        setPlans(plansJson.data);
      }
      if (subRes.ok && subJson.success) {
        setSubscriptionData(subJson.data);
      }
    } catch (err: any) {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading Plans & Billing...</p>
      </div>
    );
  }

  // Display Plans (Free Plan & Pro Plan)
  const displayPlans = [
    {
      id: 'free',
      name: 'Free Plan',
      priceInr: 0,
      description: 'Perfect for building and showcasing your initial developer portfolio.',
      features: [
        'Single Workspace Included',
        'Up to 10 Projects',
        'Manual Portfolio Data Updates',
        'Standard Subdomain (username.devvolio.in)',
        'Full Admin Portal Access (Projects, Experience, Skills, Resumes)',
        'Contact Form & Messages Inbox'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      priceInr: 99,
      isComingSoon: true,
      description: 'Unlock AI automation, multiple workspaces, and premium portfolio themes.',
      features: [
        'Multiple Workspaces Support',
        'AI-Powered Resume Parser & Auto-Importer',
        'Unlimited Projects & Experiences',
        'Varieties of Premium Portfolio Templates',
        'Custom Domain Mapping (yourname.com)',
        'Priority Support & Advanced Customizations'
      ]
    }
  ];

  return (
    <div className="space-y-10 text-left max-w-4xl mx-auto py-2">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 uppercase tracking-widest">
              Billing & Subscriptions
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-primary" />
            Plans & Subscriptions
          </h1>
          <p className="font-sans text-xs md:text-sm text-muted-foreground mt-1">
            Select the plan that fits your portfolio needs. Free plan is active for all accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase border bg-primary/10 text-primary border-primary/30 shadow-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Active Plan: Free
          </span>
        </div>
      </div>

      {/* Monthly / Yearly Billing Cycle Toggle */}
      <div className="flex justify-center items-center gap-4">
        <span className={`text-xs font-bold transition-colors ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly Billing
        </span>
        <button
          type="button"
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="relative w-14 h-7 rounded-full bg-card border border-border p-1 transition-colors hover:border-primary/50"
        >
          <div
            className={`w-5 h-5 rounded-full bg-primary transition-transform shadow-md ${
              billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold transition-colors ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly Billing
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            Save 2 Months Free
          </span>
        </div>
      </div>

      {/* 2 Plans Grid: Free Plan & Pro Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {displayPlans.map((plan) => {
          const isFree = plan.id === 'free';
          const isPro = plan.id === 'pro';
          const isCurrent = isFree;

          // Price Calculation: Monthly ₹99, Yearly ₹990 (10 months equivalent, 2 months free)
          const monthlyPrice = plan.priceInr || (isPro ? 99 : 0);
          const yearlyPrice = monthlyPrice === 0 ? 0 : monthlyPrice * 10; // ₹990 / year
          const displayPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-7 rounded-2xl border transition-all duration-300 ${
                isPro
                  ? 'border-primary/60 bg-gradient-to-b from-primary/10 via-card/70 to-card/50 shadow-2xl shadow-primary/10 ring-1 ring-primary/30'
                  : 'border-border/80 bg-card/40 hover:border-primary/30 shadow-md'
              }`}
            >
              {/* Pro Plan Highlight Tag */}
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Pro Features
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                    {isPro && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{plan.description}</p>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold text-foreground font-mono">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {displayPrice === 0 ? 'Free Forever' : billingCycle === 'yearly' ? ' / year' : ' / month'}
                    </span>
                  </div>
                  {isPro && billingCycle === 'yearly' && (
                    <p className="text-[11px] text-emerald-400 font-medium mt-1">
                      ₹82.50 / month billed annually (₹990 / year)
                    </p>
                  )}
                  {isPro && billingCycle === 'monthly' && (
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">
                      Billed monthly at ₹99 / month
                    </p>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-4 border-t border-border/50">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {isFree ? "What's Included in Free:" : "Everything in Free, plus:"}
                  </p>
                  {plan.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground font-medium leading-tight">
                      <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${isPro ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 cursor-default shadow-inner"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Current Active Plan
                  </button>
                ) : isPro ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400/90 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-sm"
                  >
                    <Clock className="w-4 h-4" />
                    Coming Soon (₹99/mo)
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
