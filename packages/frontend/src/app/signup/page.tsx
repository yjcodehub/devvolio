'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DevvolioLogo from '@/components/layout/DevvolioLogo';
import { useAuthStore } from '@/stores/useAuthStore';
import { getApiUrl } from '@/utils/api';
import { toast } from 'sonner';
import { Check, X, Loader2, ArrowRight, Globe, User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [desiredSubdomain, setDesiredSubdomain] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    mobile?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const [subdomainStatus, setSubdomainStatus] = useState<{ available: boolean | null; checking: boolean; message: string }>({
    available: null,
    checking: false,
    message: ''
  });

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

  // --- Validation Rules ---
  const validateField = (field: string, val: string, currentName = name, currentPassword = password) => {
    let errorMsg: string | undefined = undefined;

    if (field === 'name') {
      if (!val.trim()) {
        errorMsg = 'Full Name is required';
      } else if (!/^[A-Za-z\s]+$/.test(val.trim())) {
        errorMsg = 'Full Name must contain only alphabets (no numbers or special symbols)';
      } else if (val.trim().length < 2) {
        errorMsg = 'Full Name must be at least 2 characters long';
      }
    }

    if (field === 'email') {
      if (!val.trim()) {
        errorMsg = 'Email address is required';
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim())) {
        errorMsg = 'Please enter a valid email address';
      }
    }

    if (field === 'mobile') {
      if (val.trim()) {
        const cleanMobile = val.replace(/[^0-9]/g, '');
        if (cleanMobile.length !== 10) {
          errorMsg = 'Mobile number must be exactly 10 digits';
        }
      }
    }

    if (field === 'password') {
      if (!val) {
        errorMsg = 'Password is required';
      } else if (val.length < 8 || val.length > 16) {
        errorMsg = 'Password must be between 8 and 16 characters long';
      } else if (!/[A-Z]/.test(val)) {
        errorMsg = 'Must contain at least one uppercase letter (A-Z)';
      } else if (!/[a-z]/.test(val)) {
        errorMsg = 'Must contain at least one lowercase letter (a-z)';
      } else if (!/[0-9]/.test(val)) {
        errorMsg = 'Must contain at least one number (0-9)';
      } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
        errorMsg = 'Must contain at least one special symbol (!@#$%^&*)';
      } else {
        // Pattern & Sequence checks (e.g. 123, 987, 999, John@123)
        const sequences = ['123', '234', '345', '456', '567', '678', '789', '987', '876', '765', '654', '543', '432', '321'];
        for (const seq of sequences) {
          if (val.includes(seq)) {
            errorMsg = `Password cannot contain simple sequences like '${seq}'`;
            break;
          }
        }
        if (!errorMsg) {
          const repeats = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];
          for (const rep of repeats) {
            if (val.includes(rep)) {
              errorMsg = `Password cannot contain repeated numbers like '${rep}'`;
              break;
            }
          }
        }
        if (!errorMsg && currentName.trim()) {
          const nameParts = currentName.toLowerCase().trim().split(/\s+/);
          const pwdLower = val.toLowerCase();
          for (const part of nameParts) {
            if (part.length >= 3 && pwdLower.includes(part)) {
              errorMsg = `Password cannot contain your name ("${part}")`;
              break;
            }
          }
        }
      }
    }

    if (field === 'confirmPassword') {
      if (!val) {
        errorMsg = 'Confirm Password is required';
      } else if (val !== currentPassword) {
        errorMsg = 'Passwords do not match';
      }
    }

    return errorMsg;
  };

  const validateAll = () => {
    const newErrors: Record<string, string | undefined> = {
      name: validateField('name', name),
      email: validateField('email', email),
      mobile: validateField('mobile', mobile),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword, name, password)
    };

    // Filter undefined
    const cleanErrors: Record<string, string> = {};
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key]) {
        cleanErrors[key] = newErrors[key]!;
      }
    });

    setErrors(cleanErrors);
    return Object.keys(cleanErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'name') val = name;
    if (field === 'email') val = email;
    if (field === 'mobile') val = mobile;
    if (field === 'password') val = password;
    if (field === 'confirmPassword') val = confirmPassword;

    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      mobile: true,
      password: true,
      confirmPassword: true
    });

    if (!validateAll()) {
      toast.error('Please resolve validation errors before submitting');
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
          desiredSubdomain
        }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Registration failed');

      setUser(json.data.user, json.data.token);
      toast.success(`🎉 Account Created! Welcome to Devvolio, ${name}!`);
      router.replace('/onboarding');
    } catch (err: any) {
      toast.error(err.message || 'Registration error');
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
            Create Your Developer Portfolio
          </h1>
          <p className="text-xs text-muted-foreground">
            Claim your custom subdomain and launch your developer workspace instantly.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onBlur={() => handleBlur('name')}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) {
                    setErrors((prev) => ({ ...prev, name: validateField('name', e.target.value) }));
                  }
                }}
                placeholder="Yashkumar Jais"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-card/60 text-xs text-foreground focus:outline-none transition-all ${
                  errors.name ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-border focus:border-primary'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-500" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onBlur={() => handleBlur('email')}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) {
                      setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
                    }
                  }}
                  placeholder="yash@devvolio.in"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-card/60 text-xs text-foreground focus:outline-none transition-all ${
                    errors.email ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-border focus:border-primary'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-500" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onBlur={() => handleBlur('mobile')}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setMobile(clean);
                    if (touched.mobile) {
                      setErrors((prev) => ({ ...prev, mobile: validateField('mobile', clean) }));
                    }
                  }}
                  placeholder="9876543210"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-card/60 text-xs text-foreground focus:outline-none transition-all ${
                    errors.mobile ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-border focus:border-primary'
                  }`}
                />
                {errors.mobile && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-500" /> {errors.mobile}
                  </p>
                )}
              </div>
            </div>

            {/* Create Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Create Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onBlur={() => handleBlur('password')}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: validateField('password', e.target.value, name),
                        confirmPassword: confirmPassword ? validateField('confirmPassword', confirmPassword, name, e.target.value) : prev.confirmPassword
                      }));
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl border bg-card/60 text-xs text-foreground focus:outline-none transition-all ${
                    errors.password ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-border focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-500" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onBlur={() => handleBlur('confirmPassword')}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (touched.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: validateField('confirmPassword', e.target.value, name, password) }));
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl border bg-card/60 text-xs text-foreground focus:outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-border focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-500" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Desired Subdomain */}
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
              disabled={verifying}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold transition-all shadow-lg shadow-primary/20"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account & Workspace...
                </>
              ) : (
                <>
                  Create Account & Launch <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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
