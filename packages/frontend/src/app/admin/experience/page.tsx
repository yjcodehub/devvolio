'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Pencil, Trash, Calendar, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

interface Experience {
  _id: string;
  role: string;
  company: string;
  location?: string;
  type: 'work' | 'education';
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  highlights: string[];
  skillsUsed: string[];
}

export default function ExperienceManager() {
  const [list, setList] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'work' | 'education'>('work');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [skillsText, setSkillsText] = useState('');

  const fetchExperiences = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/experiences`);
      if (res.ok) {
        const json = await res.json();
        setList(json.data);
      }
    } catch (err) {
      toast.error('Failed to load experience records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const resetForm = () => {
    setRole('');
    setCompany('');
    setLocation('');
    setType('work');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setHighlightsText('');
    setSkillsText('');
    setEditingId(null);
  };

  const handleEditClick = (item: Experience) => {
    setEditingId(item._id);
    setRole(item.role);
    setCompany(item.company);
    setLocation(item.location || '');
    setType(item.type);
    
    // Format dates to YYYY-MM-DD for date input values
    setStartDate(item.startDate.split('T')[0]);
    setEndDate(item.endDate ? item.endDate.split('T')[0] : '');
    setIsCurrent(item.isCurrent);
    setDescription(item.description || '');
    setHighlightsText(item.highlights.join('\n'));
    setSkillsText(item.skillsUsed.join(', '));
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!role || !company || !startDate) {
      toast.error('Please enter role, company, and start date');
      return;
    }

    const payload = {
      role,
      company,
      location: location || undefined,
      type,
      startDate,
      endDate: isCurrent ? undefined : (endDate || undefined),
      isCurrent,
      description: description || undefined,
      highlights: highlightsText.split('\n').map((h) => h.trim()).filter(Boolean),
      skillsUsed: skillsText.split(',').map((s) => s.trim()).filter(Boolean)
    };

    try {
      const apiUrl = getApiUrl();
      const url = editingId ? `${apiUrl}/experiences/${editingId}` : `${apiUrl}/experiences`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Operation failed');

      toast.success(editingId ? 'Timeline record saved' : 'Timeline record added');
      setShowModal(false);
      resetForm();
      fetchExperiences();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this experience timeline entry?')) return;

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/experiences/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Delete failed');
      }

      toast.success('Timeline record removed');
      fetchExperiences();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Format date helper (shows month and year only)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center w-full">
        <div className="text-left">
          <h1 className="font-display text-2xl font-bold text-foreground">Timeline Manager</h1>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">Manage work experience and educational qualifications.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-semibold hover-glow-trigger transition-all"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Timeline List Table */}
      <div className="rounded-xl border border-border bg-card/30 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading timeline entries...
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No timeline records found. Click Add Record to get started.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Role / Title</th>
                  <th className="p-4">Company / School</th>
                  <th className="p-4">Date Range</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {list.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 uppercase font-bold text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${item.type === 'work' ? 'bg-primary/10 text-primary border border-primary/5' : 'bg-secondary/10 text-secondary border border-secondary/5'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-foreground">{item.role}</td>
                    <td className="p-4 text-muted-foreground font-semibold">{item.company}</td>
                    <td className="p-4 font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {formatDate(item.startDate)} — {item.isCurrent ? 'Present' : formatDate(item.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Entry"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-muted/40 px-6 py-4 border-b border-border/50">
              <h2 className="font-display text-lg font-bold text-foreground">
                {editingId ? 'Edit Timeline Entry' : 'Add Timeline Entry'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} data-lenis-prevent className="p-6 overflow-y-auto space-y-5 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Role / Title *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Software Engineer"
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Company / School Name *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Relfor Labs Pvt Ltd"
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="work">Work History</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Pune, India"
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCurrent}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-40"
                  />
                </div>

                {/* Current Checkbox */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="current"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-card text-primary focus:ring-primary"
                  />
                  <label htmlFor="current" className="text-xs font-bold text-foreground select-none cursor-pointer">
                    Current Position
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="General summary of the role..."
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Highlights Bullet Points */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Highlights (one bullet point per line)</label>
                <textarea
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  rows={4}
                  placeholder="Developed order billingsPOS system...&#10;Optimized queries speed by 20%..."
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Skills Used */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Skills Used (comma-separated)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, TypeScript, CSS"
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Modal footer buttons */}
              <div className="flex justify-end gap-3 border-t border-border/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-semibold transition-all"
                >
                  {editingId ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
