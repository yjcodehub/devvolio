'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DevvolioLogo from '@/components/layout/DevvolioLogo';
import {
  Sparkles, Globe, Zap, Code2, ArrowRight, ShieldCheck,
  Check, FileText, LayoutTemplate, Crown, Users, TrendingUp
} from 'lucide-react';

export default function DevvolioSaasLanding() {
  const [subdomain, setSubdomain] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background lighting glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Navbar */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex justify-between items-center z-20">
        <DevvolioLogo iconSize={30} />

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Developer Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold transition-all shadow-md shadow-primary/20 hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 text-center space-y-12 z-10 flex-1 flex flex-col justify-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold shadow-md shadow-primary/5 mx-auto">
          <Sparkles className="w-4 h-4" />
          Multi-Tenant Portfolio Engine 2.0
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground">
            Build Your AI-Powered Developer Portfolio in <span className="bg-gradient-to-r from-primary via-purple-400 to-emerald-400 bg-clip-text text-transparent">60 Seconds</span>
          </h1>
          <p className="font-sans text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Claim your instant subdomain <code className="text-primary font-mono font-bold">username.devvolio.in</code>, map custom domains (<code className="text-emerald-400 font-mono">john.dev</code>), and import your resume via GPT-4o AI.
          </p>
        </div>

        {/* Interactive Subdomain Claim Input Box */}
        <div className="max-w-xl mx-auto w-full p-2.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="yourname"
              className="w-full pl-4 pr-32 py-3 rounded-xl border border-border bg-background text-sm font-mono text-primary font-bold focus:outline-none focus:border-primary transition-all"
            />
            <span className="absolute right-4 text-xs text-muted-foreground font-mono select-none">
              .devvolio.in
            </span>
          </div>

          <Link
            href={`/signup${subdomain ? `?subdomain=${subdomain}` : ''}`}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold transition-all shadow-lg shadow-primary/25"
          >
            Claim Subdomain <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-12">
          <div className="p-6 rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md space-y-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary inline-block">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Instant Subdomain & Custom Domains</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get an instant portfolio URL <code className="text-primary font-mono">alex.devvolio.in</code> or connect your own domain (<code className="text-emerald-400 font-mono">alex.com</code>) with automated SSL verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md space-y-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 inline-block">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-sm">GPT-4o AI Resume Auto-Importer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload your PDF or Word resume. Our NLP AI engine parses projects, experience timelines, and skill taxonomies instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 inline-block">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-sm">GitHub & LeetCode Live Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Display real-time GitHub commit activity heatmaps and LeetCode problem solving metrics to impress recruiters.
            </p>
          </div>
        </div>

        {/* Simple Pricing Banner */}
        <div className="p-8 rounded-3xl border border-primary/30 bg-primary/5 max-w-4xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Free & Pro SaaS Pricing</span>
            <h3 className="font-display text-xl font-extrabold text-foreground">Start for Free • Upgrade Anytime</h3>
            <p className="text-xs text-muted-foreground">Free Tier includes 5 projects & subdomain. Pro Tier (₹999/mo) unlocks custom domains & unlimited projects.</p>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-extrabold shadow-lg shadow-primary/20 shrink-0"
          >
            Create Your Free Portfolio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground z-20">
        <div>
          © {new Date().getFullYear()} Devvolio SaaS Engine. All rights reserved.
        </div>
        <div className="flex items-center gap-4 font-semibold">
          <Link href="/login" className="hover:text-foreground transition-colors">Log In</Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          {/* <Link href="/superadmin" className="hover:text-amber-400 transition-colors">Super Admin</Link> */}
        </div>
      </footer>
    </div>
  );
}
