'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DevvolioLogo from '@/components/layout/DevvolioLogo';
import { useAuthStore } from '@/stores/useAuthStore';
import { getApiUrl } from '@/utils/api';
import { toast } from 'sonner';
import { 
  Sparkles, Globe, Code2, Palette, Megaphone, Target, 
  Upload, CheckCircle2, ArrowRight, Loader2, Rocket 
} from 'lucide-react';

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [discipline, setDiscipline] = useState('developer');
  const [tagline, setTagline] = useState('Senior Full Stack Developer');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const router = useRouter();
  const { user } = useAuthStore();
  const apiUrl = getApiUrl();

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    toast.loading('AI Engine extracting skills & experience from resume...');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('file', file);

      const res = await fetch(`${apiUrl}/ai/parse-resume`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const json = await res.json();
      toast.dismiss();

      if (res.ok && json.success) {
        toast.success('🎉 AI successfully imported your resume data!');
        setStep(3);
      } else {
        toast.error(json.message || 'Failed to parse resume, continuing with starter defaults.');
        setStep(3);
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Resume parsing encountered an error, continuing with defaults.');
      setStep(3);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setFinishing(true);
    toast.loading('Finalizing your portfolio workspace...');

    try {
      // Save initial hero tagline & discipline preferences
      await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero: {
            title: user?.name || user?.username || 'Developer',
            tagline,
            subtitle: `${discipline.toUpperCase()} Portfolio`
          }
        }),
        credentials: 'include'
      });

      toast.dismiss();
      toast.success('🚀 Portfolio Workspace Launched!');
      router.replace('/admin/dashboard');
    } catch (err) {
      toast.dismiss();
      router.replace('/admin/dashboard');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Header Logo & Step Progress Bar */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <DevvolioLogo iconSize={32} />
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step >= s ? 'w-16 bg-primary' : 'w-8 bg-muted/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="p-8 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-xl shadow-2xl space-y-6 text-left">
          {/* STEP 1: Discipline & Role Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Step 1 of 3</span>
                <h2 className="text-xl font-bold font-display text-foreground mt-1">Select Your Primary Discipline</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose your department focus to customize your portfolio layout and skill presets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'developer', title: 'Software Developer', icon: Code2, desc: 'Frontend, Fullstack, Mobile & Backend Engineers' },
                  { id: 'uiux', title: 'UI/UX & Product Design', icon: Palette, desc: 'Visual Designers, Product Designers & Researchers' },
                  { id: 'marketing', title: 'Growth Marketing', icon: Megaphone, desc: 'Digital Marketers, SEO & Content Strategists' },
                  { id: 'pm', title: 'Product & PM', icon: Target, desc: 'Product Managers, Technical Leads & Strategists' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = discipline === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setDiscipline(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                          : 'border-border bg-card/40 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-foreground">{item.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-xs font-extrabold transition-all shadow-lg shadow-primary/20"
              >
                Continue to AI Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: AI Resume Upload or Defaults */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Step 2 of 3</span>
                <h2 className="text-xl font-bold font-display text-foreground mt-1">Import Resume via AI Engine</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your PDF or Word resume to automatically extract your projects, work experience, and skills.
                </p>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all space-y-3 text-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Upload Resume (PDF, DOCX)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">GPT-4o-mini will automatically parse and structure your portfolio</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip & Use Blank Starter
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold hover:bg-muted transition-colors"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Workspace Launch */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary inline-block mx-auto animate-bounce">
                <Rocket className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold font-display text-foreground">Your Portfolio is Ready!</h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Your tenant workspace is active. You can now add projects, customize themes, and map custom domains.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card/60 font-mono text-xs text-primary flex items-center justify-between">
                <span>Subdomain URL:</span>
                <span className="font-bold">http://localhost:3000/admin/dashboard</span>
              </div>

              <button
                onClick={handleCompleteOnboarding}
                disabled={finishing}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold transition-all shadow-xl shadow-primary/25"
              >
                {finishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Launching Admin Dashboard...
                  </>
                ) : (
                  <>
                    Go to Admin Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
