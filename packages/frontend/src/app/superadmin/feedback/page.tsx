'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquareHeart, Star, Search, Filter, Loader2, CheckCircle2, 
  Clock, Wrench, Bug, Zap, Rocket, MessageCircle, Sparkles, 
  User, Globe, Trash2, Edit3, X, Check, ArrowUpRight, ShieldAlert,
  SlidersHorizontal, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl, getAuthHeaders } from '@/utils/api';

interface FeedbackItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  workspaceSlug?: string;
  category: 'ui_ux' | 'feature_request' | 'bug' | 'performance' | 'update' | 'general';
  rating: number;
  title: string;
  message: string;
  status: 'pending' | 'reviewed' | 'in_progress' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  reviewed: number;
  avgRating: number;
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  ui_ux: { label: 'UI/UX & Design', icon: Sparkles, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  feature_request: { label: 'Feature Request', icon: Rocket, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  bug: { label: 'Bug / Issue', icon: Bug, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  performance: { label: 'Speed & Perf', icon: Zap, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  update: { label: 'Platform Update', icon: Wrench, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  general: { label: 'General / Ideas', icon: MessageCircle, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending Review', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Clock },
  reviewed: { label: 'Reviewed', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: Wrench },
  resolved: { label: 'Resolved / Built', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
};

export default function SuperAdminFeedbackHub() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, resolved: 0, reviewed: 0, avgRating: 5.0 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Modal / Note Editor State
  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [modalStatus, setModalStatus] = useState<FeedbackItem['status']>('pending');
  const [savingNote, setSavingNote] = useState(false);

  const apiUrl = getApiUrl();

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (ratingFilter !== 'all') params.set('rating', ratingFilter);

      const res = await fetch(`${apiUrl}/feedback/admin/all?${params.toString()}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (res.ok) {
        const json = await res.json();
        setFeedbacks(json.data.feedbacks || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      } else {
        toast.error('Failed to load feedback registry');
      }
    } catch (err) {
      toast.error('Network error loading feedbacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadFeedbacks();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, categoryFilter, statusFilter, ratingFilter]);

  const handleUpdateStatus = async (id: string, newStatus: FeedbackItem['status']) => {
    try {
      const res = await fetch(`${apiUrl}/feedback/admin/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (res.ok) {
        const json = await res.json();
        setFeedbacks((prev) => prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f)));
        toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Update error');
    }
  };

  const handleSaveNoteModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback) return;

    setSavingNote(true);
    try {
      const res = await fetch(`${apiUrl}/feedback/admin/${editingFeedback._id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          status: modalStatus,
          adminNotes: adminNoteText.trim()
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const json = await res.json();
        setFeedbacks((prev) =>
          prev.map((f) => (f._id === editingFeedback._id ? { ...f, status: modalStatus, adminNotes: adminNoteText.trim() } : f))
        );
        toast.success('Admin response and status saved!');
        setEditingFeedback(null);
      } else {
        toast.error('Failed to save response');
      }
    } catch (err) {
      toast.error('Save error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteFeedback = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete feedback: "${title}"?`)) return;

    try {
      const res = await fetch(`${apiUrl}/feedback/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
        setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        toast.success('Feedback deleted');
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      toast.error('Error deleting feedback');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              SuperAdmin Governance
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <MessageSquareHeart className="w-7 h-7 text-pink-400" />
            User Feedback & Feature Requests Hub
          </h1>
          <p className="font-sans text-xs md:text-sm text-muted-foreground mt-1">
            Review user feedback, inspect tenant identity, track feature suggestions, and communicate updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-card/60 border border-border flex items-center gap-2 text-xs font-mono">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Avg Satisfaction: <strong className="text-amber-400">{stats.avgRating} / 5.0</strong></span>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/40 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Feedbacks</p>
          <p className="text-2xl font-extrabold text-foreground font-mono">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">{stats.pending}</p>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">In Progress</p>
          <p className="text-2xl font-extrabold text-purple-400 font-mono">{stats.inProgress}</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Resolved / Built</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{stats.resolved}</p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-card/40 border border-border/70 rounded-2xl p-4 shadow-sm backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, email, workspace slug, title, or message..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            <option value="ui_ux">🎨 UI/UX & Design</option>
            <option value="feature_request">💡 Feature Request</option>
            <option value="bug">🐛 Bug / Issue</option>
            <option value="performance">⚡ Speed & Performance</option>
            <option value="update">🚀 Platform Update</option>
            <option value="general">💬 General / Ideas</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="reviewed">👀 Reviewed</option>
            <option value="in_progress">🔨 In Progress</option>
            <option value="resolved">✅ Resolved / Built</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Stream Grid */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-semibold">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>Loading Feedback Records...</span>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-border/70 bg-card/20 text-center space-y-2 text-muted-foreground">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <h3 className="font-display text-base font-bold text-foreground">No Feedback Found</h3>
          <p className="text-xs">No feedback matches your current search and filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => {
            const catObj = CATEGORY_MAP[item.category] || CATEGORY_MAP.general;
            const CatIcon = catObj.icon;
            const statusObj = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusObj.icon;

            return (
              <div
                key={item._id}
                className="p-6 rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md space-y-4 hover:border-border transition-all shadow-sm"
              >
                {/* Card Top: User Info & Status Manager */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-border/40 pb-3.5">
                  {/* User Identity Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                      {item.userName ? item.userName.charAt(0) : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-sm font-bold text-foreground">{item.userName}</span>
                        <span className="text-xs text-muted-foreground font-mono">({item.userEmail})</span>
                        {item.workspaceSlug && (
                          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-[10px] font-mono border border-border/40 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-primary" />
                            {item.workspaceSlug}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Submitted on {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Status Selector & Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item._id, e.target.value as FeedbackItem['status'])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${statusObj.color}`}
                    >
                      <option value="pending">⏳ Pending Review</option>
                      <option value="reviewed">👀 Reviewed</option>
                      <option value="in_progress">🔨 In Progress</option>
                      <option value="resolved">✅ Resolved / Built</option>
                    </select>

                    <button
                      onClick={() => {
                        setEditingFeedback(item);
                        setAdminNoteText(item.adminNotes || '');
                        setModalStatus(item.status);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                      title="Write response or internal notes"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-primary" />
                      <span>{item.adminNotes ? 'Edit Response' : 'Reply / Note'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteFeedback(item._id, item.title)}
                      className="p-2 rounded-xl border border-border/50 bg-card/40 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Middle: Category, Rating & Message */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase flex items-center gap-1.5 ${catObj.color}`}>
                      <CatIcon className="w-3 h-3" />
                      {catObj.label}
                    </span>

                    <div className="flex items-center gap-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans bg-background/50 p-4 rounded-xl border border-border/40">
                    {item.message}
                  </p>
                </div>

                {/* SuperAdmin Note Display (if attached) */}
                {item.adminNotes && (
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" /> SuperAdmin Response / Internal Note:
                      </span>
                      <span className="text-[10px] text-muted-foreground">(Visible to user)</span>
                    </div>
                    <p className="text-foreground/90 font-sans leading-relaxed">{item.adminNotes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Write Admin Note / Response */}
      {editingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center bg-muted/40 px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-display text-base font-bold text-foreground">
                  Respond to User Feedback
                </h2>
              </div>
              <button
                onClick={() => setEditingFeedback(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNoteModal} className="p-6 space-y-4 text-left">
              <div className="p-3 rounded-xl bg-background/80 border border-border space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">User Feedback Summary</p>
                <p className="text-xs font-bold text-foreground">{editingFeedback.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{editingFeedback.message}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Update Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as FeedbackItem['status'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary font-semibold cursor-pointer"
                >
                  <option value="pending">⏳ Pending Review</option>
                  <option value="reviewed">👀 Reviewed</option>
                  <option value="in_progress">🔨 In Progress (Working On It)</option>
                  <option value="resolved">✅ Resolved / Implemented</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex justify-between">
                  <span>SuperAdmin Response / Note</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Visible to the user on their feedback page)</span>
                </label>
                <textarea
                  rows={4}
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  placeholder="e.g. Great idea! We've prioritized this in the upcoming release, or Thanks for the bug report, this is now patched..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-y shadow-inner"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFeedback(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20"
                >
                  {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Response & Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
