'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Sparkles, Zap, Shield, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingAdmin() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
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

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const executeUpgradeVerification = async (orderId: string, paymentId: string, signature: string, planId: string) => {
    toast.loading('Verifying Razorpay payment & upgrading workspace...');
    try {
      const verifyRes = await fetch(`${apiUrl}/billing/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          planId,
          billingCycle
        }),
        credentials: 'include'
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyJson.message || 'Payment verification failed');

      toast.dismiss();
      toast.success(`🎉 Workspace Upgraded to ${planId.toUpperCase()} Plan!`);
      fetchData();
    } catch (verifyErr: any) {
      toast.dismiss();
      toast.error(verifyErr.message || 'Payment verification failed');
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    setUpgradingPlan(planId);

    try {
      const res = await fetch(`${apiUrl}/billing/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to initialize order');

      const { order, razorpayKey } = json.data;

      // Check if real Razorpay Key ID is configured
      const isPlaceholderKey = !razorpayKey || razorpayKey === 'rzp_test_devvolioKey';

      if (isPlaceholderKey) {
        toast.info('Simulating Instant Upgrade (Set RAZORPAY_KEY_ID in .env for real checkout).');
        await executeUpgradeVerification(
          order.id || `order_mock_${Date.now()}`,
          `pay_dev_${Date.now()}`,
          'mock_signature',
          planId
        );
        return;
      }

      // Real Razorpay Checkout Modal
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: 'INR',
        name: 'Devvolio SaaS Platform',
        description: `Upgrade Workspace to ${planId.toUpperCase()} Plan (${billingCycle})`,
        order_id: order.id,
        handler: async function (response: any) {
          await executeUpgradeVerification(
            order.id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            planId
          );
        },
        prefill: {
          name: 'Developer Workspace Owner',
          email: 'lakshraj2121@gmail.com'
        },
        theme: {
          color: '#6d5dfc'
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await executeUpgradeVerification(order.id, `pay_dev_${Date.now()}`, 'mock_signature', planId);
      }
    } catch (err: any) {
      toast.error(err.message || 'Upgrade checkout failed');
    } finally {
      setUpgradingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading Subscription & Billing Metrics...</p>
      </div>
    );
  }

  const sub = subscriptionData?.subscription;
  const metrics = subscriptionData?.metrics || {};
  const currentPlanId = sub?.plan || 'free';

  const projectsPercent = metrics.maxProjects === Infinity ? 100 : Math.min(100, (metrics.projectsCount / metrics.maxProjects) * 100);
  const aiPercent = Math.min(100, (metrics.aiGenerationsCount / metrics.maxAiGenerations) * 100);

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary" />
            Subscription & Billing
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Manage your multi-tenant SaaS workspace plan, usage quotas, and Razorpay INR billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase border ${
            currentPlanId === 'free'
              ? 'bg-muted/40 text-muted-foreground border-border'
              : 'bg-primary/10 text-primary border-primary/30 shadow-lg shadow-primary/10'
          }`}>
            Current Plan: {currentPlanId}
          </span>
        </div>
      </div>

      {/* Workspace Usage Quotas Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projects Meter */}
        <div className="p-5 rounded-xl border border-border bg-card/30 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-foreground">Projects Limit</span>
            <span className="text-primary">
              {metrics.projectsCount} / {metrics.maxProjects === Infinity ? '∞' : metrics.maxProjects} Used
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted/60 overflow-hidden">
            <div
              className={`h-full transition-all ${projectsPercent >= 100 ? 'bg-rose-500' : 'bg-primary'}`}
              style={{ width: `${projectsPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {metrics.maxProjects === Infinity ? 'Unlimited projects allowed on PRO plan.' : 'Upgrade to PRO to build unlimited project portfolios.'}
          </p>
        </div>

        {/* AI Generations Meter */}
        <div className="p-5 rounded-xl border border-border bg-card/30 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-foreground">Monthly AI Quota</span>
            <span className="text-emerald-400 font-mono">
              {metrics.aiGenerationsCount} / {metrics.maxAiGenerations} Used
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted/60 overflow-hidden">
            <div
              className={`h-full transition-all ${aiPercent >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${aiPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Resets on {new Date(sub?.usage?.resetAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* Custom Domain Meter */}
        <div className="p-5 rounded-xl border border-border bg-card/30 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-foreground">Custom Domain (john.dev)</span>
            {metrics.customDomainAllowed ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                PRO Feature
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {metrics.customDomainAllowed
              ? 'Connect any custom domain in Settings ➔ Subdomains & Domains.'
              : 'Upgrade to PRO to connect your own domain (e.g. devvolio.in).'}
          </p>
        </div>
      </div>

      {/* Monthly / Yearly Billing Cycle Toggle */}
      <div className="flex justify-center items-center gap-4 py-4">
        <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly Billing
        </span>
        <button
          type="button"
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="relative w-14 h-7 rounded-full bg-card border border-border p-1 transition-colors"
        >
          <div
            className={`w-5 h-5 rounded-full bg-primary transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly Billing
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            Save 2 Months Free
          </span>
        </div>
      </div>

      {/* INR Pricing Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const displayPrice = billingCycle === 'yearly' ? plan.priceInr * 10 : plan.priceInr;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all ${
                plan.id === 'pro'
                  ? 'border-primary bg-card/60 shadow-2xl shadow-primary/10 ring-1 ring-primary/40'
                  : 'border-border bg-card/20 hover:border-primary/40'
              }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  Most Popular for Developers
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{plan.description}</p>
                </div>

                <div className="pt-2">
                  <span className="font-display text-3xl font-extrabold text-foreground">
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {plan.priceInr === 0 ? '' : billingCycle === 'yearly' ? ' / year' : ' / month'}
                  </span>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/50">
                  {plan.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgradingPlan === plan.id || plan.id === 'free'}
                    className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      plan.id === 'pro'
                        ? 'bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20'
                        : 'border border-border bg-card hover:bg-muted text-foreground'
                    }`}
                  >
                    {upgradingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Upgrade...
                      </>
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
