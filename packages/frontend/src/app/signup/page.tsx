'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DevvolioLogo from '@/components/layout/DevvolioLogo';
import { useAuthStore } from '@/stores/useAuthStore';
import { getApiUrl } from '@/utils/api';
import { toast } from 'sonner';
import { Check, X, Loader2, ArrowRight, Globe, User, Mail, Lock, Phone, KeyRound, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [desiredSubdomain, setDesiredSubdomain] = useState('');
  
  const [subdomainStatus, setSubdomainStatus] = useState<{ available: boolean | null; checking: boolean; message: string }>({
    available: null,
    checking: false,
    message: ''
  });

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();
  const apiUrl = getApiUrl();

  // Auto-fill subdomain from name if untouched
  useEffect(() => {
    if (name && !desiredSubdomain) {
      const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
      setDesiredSubdomain(slug);
    }
  }, [name, desiredSubdomain]);

  // Live subdomain availability check
  useEffect(() => {
    if (!desiredSubdomain || desiredSubdomain.length < 3) {
      setSubdomainStatus({ available: null, checking: false, message: 'Subdomain must be at least 3 characters' });
      return;
    }

    const timer = setTimeout(async () => {
      setSubdomainStatus(prev => ({ ...prev, checking: true }));
      try {
        const res = await fetch(`${apiUrl}/auth/check-subdomain/${desiredSubdomain}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setSubdomainStatus({
            available: json.data.available,
            checking: false,
            message: json.data.available ? 'Subdomain is available!' : 'Subdomain is taken, appends random digits.'
          });
        }
      } catch (err) {
        setSubdomainStatus({ available: null, checking: false, message: '' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [desiredSubdomain, apiUrl]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch(`${apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send OTP verification code');

      toast.success(`📩 6-Digit OTP sent to ${email}`);
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'OTP dispatch error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code sent to your email');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          otp: otp.trim(),
          desiredSubdomain
        }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Registration failed');

      setUser(json.data.user);
      toast.success(`🎉 Email Verified! Welcome to Devvolio, ${name}!`);
      router.replace('/onboarding');
    } catch (err: any) {
      toast.error(err.message || 'Verification error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <DevvolioLogo iconSize={32} />
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {step === 'info' ? 'Create Your Developer Portfolio' : 'Verify Your Email OTP'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === 'info'
              ? 'Claim your subdomain and complete email OTP verification to launch.'
              : `Enter the 6-digit verification code sent to ${email}`}
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-xl shadow-2xl space-y-6">
          {step === 'info' ? (
            /* STEP 1: Account Info Form */
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Yashkumar Jais"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yash@devvolio.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Create Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" /> Desired Subdomain
                  </label>

                  {subdomainStatus.checking ? (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                    </span>
                  ) : subdomainStatus.available === true ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Available
                    </span>
                  ) : subdomainStatus.available === false ? (
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <X className="w-3 h-3" /> Taken (will append digits)
                    </span>
                  ) : null}
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={desiredSubdomain}
                    onChange={(e) => setDesiredSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="yash"
                    className="w-full pr-28 pl-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-xs font-mono text-primary font-bold focus:outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute right-3.5 text-xs text-muted-foreground font-mono select-none">
                    .devvolio.in
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold transition-all shadow-lg shadow-primary/20"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP Code...
                  </>
                ) : (
                  <>
                    Send OTP Verification Code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Input & Verification Form */
            <form onSubmit={handleVerifyAndRegister} className="space-y-4 text-left">
              <div className="space-y-2 text-center py-2">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 inline-block">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Check your inbox for a 6-digit verification code sent to <span className="text-primary font-bold">{email}</span>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center px-4 py-3 rounded-xl border border-primary/50 bg-card/60 text-lg font-mono tracking-[8px] text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code & Provisioning...
                  </>
                ) : (
                  <>
                    Verify OTP & Create Workspace <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex justify-between items-center pt-3 border-t border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Info
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="text-primary font-bold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="text-center pt-2 text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
