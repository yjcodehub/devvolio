'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquareHeart, Star, Send, Loader2, CheckCircle2, 
  Clock, AlertCircle, Sparkles, MessageSquare, Wrench, Bug, 
  Zap, Rocket, MessageCircle, HelpCircle, User
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl, getAuthHeaders } from '@/utils/api';
import { useAuthStore } from '@/stores/useAuthStore';

interface FeedbackItem {
  _id: string;
  category: 'ui_ux' | 'feature_request' | 'bug' | 'performance' | 'update' | 'general';
  rating: number;
  title: string;
  message: string;
  status: 'pending' | 'reviewed' | 'in_progress' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}

const CATEGORIES = [
  { id: 'ui_ux', label: 'UI/UX & Design', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'feature_request', label: 'Feature Request', icon: <Rocket className="w-3.5 h-3.5" />, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { id: 'bug', label: 'Bug / Issue', icon: <Bug className="w-3.5 h-3.5" />, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { id: 'performance', label: 'Speed & Performance', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'update', label: 'Platform Update', icon: <Wrench className="w-3.5 h-3.5" />, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'general', label: 'General / Ideas', icon: <MessageCircle className="w-3.5 h-3.5" />, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
];

const RATING_LABELS: Record<number, string> = {
  1: '1 - Needs Urgent Work',
  2: '2 - Below Expectations',
  3: '3 - Satisfactory',
  4: '4 - Very Good',
  5: '5 - Exceptional Experience'
};

const STATUS_BADGES: Record<string, { label: string; class: string; icon: any }> = {
  pending: { label: 'Under Review', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
  reviewed: { label: 'Reviewed by SuperAdmin', class: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', class: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Wrench },
  resolved: { label: 'Implemented / Resolved', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
};

export default function UserFeedbackPage() {
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [category, setCategory] = useState<string>('ui_ux');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const apiUrl = getApiUrl();

  const loadMyFeedback = async () => {
    try {
      const res = await fetch(`${apiUrl}/feedback/my`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        setFeedbacks(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load feedback history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a feedback title');
      return;
    }
    if (!message.trim()) {
      toast.error('Please provide details for your feedback');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          category,
          rating,
          title: title.trim(),
          message: message.trim()
        }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit feedback');

      toast.success('🎉 Thank you! Your feedback has been sent directly to the SuperAdmin.');
      setTitle('');
      setMessage('');
      setCategory('ui_ux');
      setRating(5);
      
      // Prepend to feedback list
      setFeedbacks((prev) => [json.data, ...prev]);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 text-left max-w-4xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" />
              Community & Governance
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <MessageSquareHeart className="w-7 h-7 text-pink-400" />
            Feedback & Feature Requests
          </h1>
          <p className="font-sans text-xs md:text-sm text-muted-foreground mt-1">
            Share ideas, report issues, or suggest UI/UX improvements directly to the Devvolio SuperAdmin.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card/40 px-3.5 py-2 rounded-xl border border-border/60">
          <User className="w-3.5 h-3.5 text-primary" />
          <span>Submitting as: <strong className="text-foreground">{user?.email || 'Authenticated User'}</strong></span>
        </div>
      </div>

      {/* Submission Card Form */}
      <div className="bg-card/40 border border-border/70 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex items-center gap-2 border-b border-border/40 pb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Submit Your Thoughts</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              Category
              <span className="text-[10px] text-muted-foreground font-normal">(Select what your feedback is about)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                        : 'bg-card/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/50'
                    }`}
                  >
                    <span className={isSelected ? 'text-white' : ''}>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground">Overall Experience Rating</label>
              <span className="text-xs font-semibold text-amber-400 font-mono">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-card/60 p-3 rounded-xl border border-border/50 w-fit">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 rounded-md hover:scale-125 transition-all text-amber-400 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        active ? 'fill-amber-400 text-amber-400 drop-shadow-md' : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex justify-between">
              <span>Title / Subject</span>
              <span className="text-[10px] text-muted-foreground font-mono">{title.length} / 200</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Add dark/light template switcher, or fix padding on mobile resume view"
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>

          {/* Detailed Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex justify-between">
              <span>Detailed Description</span>
              <span className="text-[10px] text-muted-foreground font-mono">{message.length} / 3000</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your feedback, feature idea, bug reproduction steps, or thoughts in detail..."
              maxLength={3000}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-inner resize-y"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Feedback...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* User History Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            My Submitted Feedback ({feedbacks.length})
          </h2>
          <span className="text-xs text-muted-foreground">Track updates and SuperAdmin responses</span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center gap-2 text-muted-foreground text-xs font-semibold">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Loading previous feedback...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 rounded-2xl border border-border/60 bg-card/20 text-center space-y-2 text-muted-foreground">
            <HelpCircle className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-xs font-semibold text-foreground">No Feedback Submitted Yet</p>
            <p className="text-[11px]">Your ideas and suggestions will appear here once submitted.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {feedbacks.map((item) => {
              const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[5];
              const statusObj = STATUS_BADGES[item.status] || STATUS_BADGES.pending;
              const StatusIcon = statusObj.icon;

              return (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md space-y-3 hover:border-border transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase flex items-center gap-1 ${catObj.color}`}>
                        {catObj.icon}
                        {catObj.label}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1.5 w-fit ${statusObj.class}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusObj.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                  </div>

                  {/* SuperAdmin Note / Reply (if provided) */}
                  {item.adminNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1 text-xs">
                      <p className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" /> SuperAdmin Response:
                      </p>
                      <p className="text-foreground/90 leading-relaxed font-sans">{item.adminNotes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
