'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Pencil, Trash, Loader2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

interface Skill {
  _id: string;
  name: string;
  category: 'Frameworks & Libraries' | 'Languages' | 'Tools & Platforms' | 'Domains' | 'Databases' | 'AI Tools' | 'Methodologies';
  proficiency: number;
  icon?: string;
  featured: boolean;
  order: number;
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Frameworks & Libraries' | 'Languages' | 'Tools & Platforms' | 'Domains' | 'Databases' | 'AI Tools' | 'Methodologies'>('Frameworks & Libraries');
  const [proficiency, setProficiency] = useState(80);
  const [icon, setIcon] = useState('');
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);

  // Filter skills by name or category
  const filteredSkills = skills.filter((skill) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      skill.name.toLowerCase().includes(query) ||
      skill.category.toLowerCase().includes(query)
    );
  });

  const fetchSkills = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/skills`);
      if (res.ok) {
        const json = await res.json();
        setSkills(json.data);
      }
    } catch (err) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const resetForm = () => {
    setName('');
    setCategory('Frameworks & Libraries');
    setProficiency(80);
    setIcon('');
    setFeatured(false);
    setOrder(0);
    setEditingId(null);
  };

  const handleEditClick = (skill: Skill) => {
    setEditingId(skill._id);
    setName(skill.name);
    setCategory(skill.category);
    setProficiency(skill.proficiency);
    setIcon(skill.icon || '');
    setFeatured(skill.featured);
    setOrder(skill.order);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !category) {
      toast.error('Please enter skill name and select a category');
      return;
    }

    const payload = {
      name,
      category,
      proficiency: Number(proficiency),
      icon: icon || undefined,
      featured,
      order: Number(order)
    };

    try {
      const apiUrl = getApiUrl();
      const url = editingId ? `${apiUrl}/skills/${editingId}` : `${apiUrl}/skills`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Save failed');

      toast.success(editingId ? 'Skill updated successfully' : 'Skill created successfully');
      setShowModal(false);
      resetForm();
      fetchSkills();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this skill tag?')) return;

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/skills/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Delete failed');
      }

      toast.success('Skill tag removed');
      fetchSkills();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center w-full">
        <div className="text-left">
          <h1 className="font-display text-2xl font-bold text-foreground">Skills Arsenal</h1>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">Manage languages, libraries, and visual competencies.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-semibold hover-glow-trigger transition-all"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative w-full max-w-md text-left">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by skill name or category..."
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card/65 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Skills Table List */}
      <div className="rounded-xl border border-border bg-card/30 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading skills...
          </div>
        ) : skills.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No skill tags found. Click Add Skill to create one.
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm font-semibold">
            No matching skills or categories found for "{searchQuery}"
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Proficiency</th>
                  <th className="p-4">Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSkills.map((skill) => (
                  <tr key={skill._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        {skill.icon && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                            {skill.icon}
                          </span>
                        )}
                        <span>{skill.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold uppercase text-[10px]">{skill.category}</td>
                    <td className="p-4 font-mono font-bold text-primary">{skill.proficiency}%</td>
                    <td className="p-4 font-mono font-semibold">{skill.order}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleEditClick(skill)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Skill"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill._id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Skill"
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
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-muted/40 px-6 py-4 border-b border-border/50">
              <h2 className="font-display text-lg font-bold text-foreground">
                {editingId ? 'Edit Skill Tag' : 'Add Skill Tag'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Skill Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="React.js"
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="Frameworks & Libraries">Frameworks & Libraries</option>
                  <option value="Languages">Languages</option>
                  <option value="Tools & Platforms">Tools & Platforms</option>
                  <option value="Domains">Domains</option>
                  <option value="Databases">Databases</option>
                  <option value="AI Tools">AI Tools</option>
                  <option value="Methodologies">Methodologies</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Proficiency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Proficiency (0-100) *</label>
                  <input
                    type="number"
                    value={proficiency}
                    onChange={(e) => setProficiency(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>

                {/* Sorting Order */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Order *</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              {/* React Icon name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">React Icon Component Name</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="SiReact"
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="feat"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-card text-primary focus:ring-primary"
                />
                <label htmlFor="feat" className="text-xs font-bold text-foreground select-none cursor-pointer">
                  Featured Skill (Displays prominently)
                </label>
              </div>

              {/* Submit Buttons */}
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
                  {editingId ? 'Save Changes' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
