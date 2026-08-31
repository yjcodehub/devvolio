'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DevvolioLogo from '@/components/layout/DevvolioLogo';
import { useAuthStore } from '@/stores/useAuthStore';
import { getApiUrl, getAuthHeaders } from '@/utils/api';
import { toast } from 'sonner';
import { 
  Code2, Palette, CheckCircle2, ArrowRight, Loader2, Sparkles, 
  Check, Lock, Zap, Layers, Terminal, ArrowLeft
} from 'lucide-react';
import { color } from 'framer-motion';

const DEVELOPER_PRESETS = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend & Systems Engineer',
  'Mobile App Developer',
  'DevOps & Cloud Architect'
];

const UIUX_PRESETS = [
  'Product Designer',
  'UI/UX Designer',
  'Design Systems Lead',
  'Visual & Motion Designer',
  'UX Researcher'
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(2); // Step 1 is registration (completed), start at Step 2
  const [discipline, setDiscipline] = useState<'developer' | 'uiux'>('developer'); // Default to developer
  const [roleTitle, setRoleTitle] = useState('Full Stack Developer');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
  const [finishing, setFinishing] = useState(false);

  const router = useRouter();
  const { user } = useAuthStore();
  const apiUrl = getApiUrl();

  const handleSelectDiscipline = (newDiscipline: 'developer' | 'uiux') => {
    setDiscipline(newDiscipline);
    if (newDiscipline === 'developer') {
      if (UIUX_PRESETS.includes(roleTitle) || !roleTitle) {
        setRoleTitle('Full Stack Developer');
      }
    } else {
      if (DEVELOPER_PRESETS.includes(roleTitle) || !roleTitle) {
        setRoleTitle('Product Designer');
      }
    }
  };

  const handleCompleteOnboarding = async () => {
    setFinishing(true);
    const categoryTitle = discipline === 'developer' ? 'Software Developer' : 'UI/UX & Product Design';
    const specializationTitle = roleTitle || (discipline === 'developer' ? 'Full Stack Developer' : 'Product Designer');

    toast.loading(`Finalizing your ${categoryTitle} Workspace...`);

    try {
      // Save initial hero title (Category Name) & subtitle (Specialization)
      await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          hero: {
            title: categoryTitle,
            subtitle: specializationTitle,
            tagline: `Welcome to my interactive ${discipline === 'developer' ? 'developer' : 'design'} portfolio powered by Devvolio.`
          }
        }),
        credentials: 'include'
      });

      toast.dismiss();
      toast.success('🚀 Portfolio Workspace Launched! Welcome to Devvolio.');
      router.replace('/admin/dashboard');
    } catch (err) {
      toast.dismiss();
      router.replace('/admin/dashboard');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10 my-8">
        {/* Header Logo & Step Progress */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <DevvolioLogo iconSize={34} />
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {/* Step 1: Registration (Completed) */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[10px]">
                <Check className="w-3 h-3" />
              </span>
              <span className="hidden sm:inline">1. Registration</span>
            </div>

            <div className="w-8 h-[2px] bg-emerald-500/40" />

            {/* Step 2: Category */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${
              step >= 2 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                step === 2 
                  ? 'bg-primary text-white font-bold ring-2 ring-primary/30' 
                  : step > 2 
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-500' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {step > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span className="hidden sm:inline">2. Category</span>
            </div>

            <div className={`w-8 h-[2px] ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />

            {/* Step 3: Subscription Plan */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${
              step === 3 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                step === 3 ? 'bg-primary text-white font-bold ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </span>
              <span className="hidden sm:inline">3. Subscription</span>
            </div>
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl space-y-6 text-left">
          
          {/* ========================================================================= */}
          {/* STEP 2: Category Selection (Developer & UI/UX) & Role Tagline */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Terminal className="w-3 h-3" /> Step 2 • Category Selection
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">Select Your Portfolio Category</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose your primary profession to personalize your portfolio presets and theme styling.
                </p>
              </div>

              {/* Two Selectable Category Cards: Developer & UI/UX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Software Developer Card */}
                <div
                  onClick={() => handleSelectDiscipline('developer')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                    discipline === 'developer'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/40 shadow-lg shadow-primary/10'
                      : 'border-border bg-card/40 hover:border-primary/40 hover:bg-card/70'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      discipline === 'developer' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      discipline === 'developer' ? 'bg-primary text-white' : 'border border-border bg-card'
                    }`}>
                      {discipline === 'developer' && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">Software Developer & Engineer</h3>
                      {discipline === 'developer' && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Frontend, Full Stack, Backend, Mobile, Cloud, AI & Systems Engineers.
                    </p>
                  </div>
                </div>

                {/* 2. UI/UX & Product Design Card */}
                <div
                  onClick={() => handleSelectDiscipline('uiux')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                    discipline === 'uiux'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/40 shadow-lg shadow-primary/10'
                      : 'border-border bg-card/40 hover:border-primary/40 hover:bg-card/70'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      discipline === 'uiux' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Palette className="w-5 h-5" />
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      discipline === 'uiux' ? 'bg-primary text-white' : 'border border-border bg-card'
                    }`}>
                      {discipline === 'uiux' && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">UI/UX & Product Design</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Product Designers, Visual Designers, Design System Leads & UX Researchers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Title Customizer with Dynamic Category Preset Pills */}
              <div className="p-4 rounded-xl border border-border/80 bg-card/40 space-y-3">
                <label className="block text-xs font-semibold text-foreground">
                  Specify Your {discipline === 'developer' ? 'Developer' : 'Design'} Specialization
                </label>
                
                {/* Preset Pills based on Selected Category */}
                <div className="flex flex-wrap gap-1.5">
                  {(discipline === 'developer' ? DEVELOPER_PRESETS : UIUX_PRESETS).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRoleTitle(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        roleTitle === preset
                          ? 'bg-primary text-white font-semibold shadow-sm'
                          : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Custom Title Input */}
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder={discipline === 'developer' ? 'e.g. Senior Full Stack Engineer' : 'e.g. Lead Product Designer'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                />
              </div>

              {/* Other Categories Coming Soon Note */}
              <div className="p-3.5 rounded-xl border border-border/50 bg-card/25 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground/70" />
                  <span>Product Managers, Marketers & Technical Writers</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                  Coming Soon
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setStep(3)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold transition-all shadow-lg shadow-primary/25"
              >
                Proceed to Plan Selection <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Subscription Selection (Free vs Pro 99 Rs) */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Zap className="w-3 h-3" /> Step 3 • Subscription Selection
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">Choose Your Subscription Plan</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Start free today with full manual control over your developer portfolio and admin portal.
                </p>
              </div>

              {/* Comparison Cards: FREE vs PRO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                
                {/* 1. FREE PLAN (Default Active) */}
                <div 
                  onClick={() => setSelectedPlan('free')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                    selectedPlan === 'free'
                      ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                      : 'border-border bg-card/40 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-extrabold tracking-wide uppercase">
                          Free Tier
                        </span>
                        <h3 className="text-lg font-bold font-display text-foreground mt-1">Starter Free</h3>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold font-display text-foreground">₹0</span>
                      <span className="text-xs text-muted-foreground">/ Free Forever</span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Complete manual portfolio control with all core admin features to showcase your talent.
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Single Workspace</strong> (1 Portfolio Site)</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Up to <strong>10 Projects</strong> showcase</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Full Admin Dashboard</strong> & manual CRUD</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Technical Skills & Arsenal matrix</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Career Timeline & Experience manager</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Developer Matrix (GitHub, LeetCode, Spotify)</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Motion Terminal Hero customizer</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Subdomain URL (<code>user.devvolio.in</code>)</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Section Visibility & Layout toggles</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-center text-xs font-bold">
                      ✓ Default Active Plan
                    </div>
                  </div>
                </div>

                {/* 2. PRO PLAN (99 Rs • ShadCN Skeleton / Coming Soon) */}
                <div className="p-5 rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/10 via-card/40 to-card/40 flex flex-col justify-between space-y-4 relative overflow-hidden select-none">
                  {/* Subtle Shimmer Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary animate-spin" /> Coming Soon
                        </span>
                        <h3 className="text-lg font-bold font-display text-foreground mt-1">Pro AI Edition</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                        99 Rs
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold font-display text-foreground">₹99</span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      AI-powered resume ingestion, multiple workspaces, and unlimited templates for accelerated growth.
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>Multiple Workspaces</strong> & Multi-Portfolios</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>AI Resume Parser</strong> (Auto-extract all data to DB)</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>Unlimited Projects</strong> & Case Studies</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Varieties of Luxury Templates & Themes</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>AI Bio & Case Study generation assistant</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Advanced Visitor & Conversion analytics</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground text-[11px]">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Priority Support & Global Cloud CDN</span>
                      </div>
                    </div>

                    {/* Skeleton Representation Bar */}
                    <div className="p-2.5 rounded-xl bg-card/60 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>AI Parser Configuration</span>
                        <span className="text-primary font-bold">Pro Feature</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden relative">
                        <div className="h-full w-2/3 bg-primary/40 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 relative z-10">
                    <button
                      disabled
                      className="w-full py-2.5 px-3 rounded-xl bg-muted/60 border border-border text-muted-foreground text-center text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Pro Available Soon (99 Rs)
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={finishing}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Category
                </button>

                <button
                  onClick={handleCompleteOnboarding}
                  disabled={finishing}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold transition-all shadow-xl shadow-primary/25"
                >
                  {finishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Launching Admin Dashboard...
                    </>
                  ) : (
                    <>
                      Launch Admin Dashboard with Free <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
