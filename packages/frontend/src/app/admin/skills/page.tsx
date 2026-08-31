'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Loader2, X, Search, Sparkles, Star, 
  Check, Layers, Award, Zap, ChevronDown, Filter
} from 'lucide-react';
import { 
  SiReact, SiAngular, SiNextdotjs, SiTypescript, SiJavascript, 
  SiNodedotjs, SiTailwindcss, SiBootstrap, SiMongodb, SiMysql, 
  SiPhp, SiGithub, SiPostman, SiGraphql, SiGit, 
  SiPython, SiHtml5, SiExpress, SiDocker, 
  SiRedux, SiNestjs, SiSass, SiFirebase, SiVercel 
} from 'react-icons/si';
import { FaDatabase, FaCode, FaRobot, FaBrain, FaLaptopCode, FaServer } from 'react-icons/fa';
import { toast } from 'sonner';
import { getApiUrl, getAuthHeaders } from '@/utils/api';

interface CatalogSkill {
  _id: string;
  name: string;
  category: string;
  icon?: string;
  isSystem?: boolean;
}

interface WorkspaceSkill {
  _id: string;
  skillId: string;
  name: string;
  category: string;
  icon?: string;
  proficiency: number;
  featured: boolean;
  order: number;
}

const CATEGORY_COLORS: Record<string, { badge: string; border: string; glow: string; text: string }> = {
  'Languages': { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', border: 'hover:border-amber-500/40', glow: 'from-amber-500/5', text: 'text-amber-400' },
  'Frameworks & Libraries': { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', border: 'hover:border-cyan-500/40', glow: 'from-cyan-500/5', text: 'text-cyan-400' },
  'Databases': { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', border: 'hover:border-emerald-500/40', glow: 'from-emerald-500/5', text: 'text-emerald-400' },
  'DevOps & Cloud': { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', border: 'hover:border-blue-500/40', glow: 'from-blue-500/5', text: 'text-blue-400' },
  'Tools & Platforms': { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', border: 'hover:border-purple-500/40', glow: 'from-purple-500/5', text: 'text-purple-400' },
  'UI/UX & Design': { badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20', border: 'hover:border-pink-500/40', glow: 'from-pink-500/5', text: 'text-pink-400' },
  'AI & Machine Learning': { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', border: 'hover:border-rose-500/40', glow: 'from-rose-500/5', text: 'text-rose-400' },
  'Methodologies & Architecture': { badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', border: 'hover:border-indigo-500/40', glow: 'from-indigo-500/5', text: 'text-indigo-400' },
  'Other': { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', border: 'hover:border-slate-500/40', glow: 'from-slate-500/5', text: 'text-slate-400' }
};

const getSkillIcon = (iconName?: string) => {
  if (!iconName) return <FaCode className="w-5 h-5 text-primary" />;

  const map: Record<string, React.ReactNode> = {
    siangular: <SiAngular className="w-5 h-5 text-red-500" />,
    sireact: <SiReact className="w-5 h-5 text-cyan-400" />,
    sinextdotjs: <SiNextdotjs className="w-5 h-5 text-foreground" />,
    sitypescript: <SiTypescript className="w-5 h-5 text-blue-500" />,
    sijavascript: <SiJavascript className="w-5 h-5 text-yellow-400" />,
    sinodedotjs: <SiNodedotjs className="w-5 h-5 text-green-500" />,
    sitailwindcss: <SiTailwindcss className="w-5 h-5 text-cyan-400" />,
    sibootstrap: <SiBootstrap className="w-5 h-5 text-purple-500" />,
    simongodb: <SiMongodb className="w-5 h-5 text-green-500" />,
    simysql: <SiMysql className="w-5 h-5 text-blue-400" />,
    siphp: <SiPhp className="w-5 h-5 text-indigo-400" />,
    siopenai: <FaRobot className="w-5 h-5 text-emerald-400" />,
    sigithub: <SiGithub className="w-5 h-5 text-foreground" />,
    sipostman: <SiPostman className="w-5 h-5 text-orange-500" />,
    sigraphql: <SiGraphql className="w-5 h-5 text-pink-500" />,
    sigit: <SiGit className="w-5 h-5 text-orange-600" />,
    sipython: <SiPython className="w-5 h-5 text-yellow-500" />,
    sihtml5: <SiHtml5 className="w-5 h-5 text-orange-500" />,
    sicss3: <SiHtml5 className="w-5 h-5 text-blue-500" />,
    siexpress: <SiExpress className="w-5 h-5 text-foreground" />,
    sidocker: <SiDocker className="w-5 h-5 text-blue-400" />,
    siamazonaws: <FaServer className="w-5 h-5 text-orange-400" />,
    siredux: <SiRedux className="w-5 h-5 text-purple-500" />,
    sinestjs: <SiNestjs className="w-5 h-5 text-red-500" />,
    sisass: <SiSass className="w-5 h-5 text-pink-400" />,
    sifirebase: <SiFirebase className="w-5 h-5 text-amber-500" />,
    sivercel: <SiVercel className="w-5 h-5 text-foreground" />,
    fadatabase: <FaDatabase className="w-5 h-5 text-blue-500" />,
    facode: <FaCode className="w-5 h-5 text-primary" />,
    farobot: <FaRobot className="w-5 h-5 text-amber-500" />,
    fabrain: <FaBrain className="w-5 h-5 text-purple-500" />,
    falaptopcode: <FaLaptopCode className="w-5 h-5 text-primary" />,
    faserver: <FaServer className="w-5 h-5 text-slate-400" />
  };

  return map[iconName.toLowerCase()] || <FaCode className="w-5 h-5 text-primary" />;
};

const ALL_CATEGORIES = [
  'Languages',
  'Frameworks & Libraries',
  'Databases',
  'DevOps & Cloud',
  'Tools & Platforms',
  'UI/UX & Design',
  'AI & Machine Learning',
  'Methodologies & Architecture',
  'Other'
];

export default function SkillsManager() {
  const [workspaceSkills, setWorkspaceSkills] = useState<WorkspaceSkill[]>([]);
  const [catalog, setCatalog] = useState<CatalogSkill[]>([]);
  const [loading, setLoading] = useState(true);

  // Combobox & Search States
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('All');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active skills grid filter state
  const [gridSearch, setGridSearch] = useState('');
  const [selectedGridCategory, setSelectedGridCategory] = useState('All');

  // Custom Modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Frameworks & Libraries');
  const [customIcon, setCustomIcon] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);

  // Fetch Master Catalog & User's Workspace Skills
  const loadData = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const headers = getAuthHeaders();

      const [catRes, userRes] = await Promise.all([
        fetch(`${apiUrl}/skills/catalog`, { headers, credentials: 'include' }),
        fetch(`${apiUrl}/skills`, { headers, credentials: 'include' })
      ]);

      if (catRes.ok) {
        const catJson = await catRes.json();
        setCatalog(catJson.data || []);
      }

      if (userRes.ok) {
        const userJson = await userRes.json();
        setWorkspaceSkills(userJson.data || []);
      }
    } catch (err) {
      toast.error('Failed to load skills library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSkillIds = new Set(workspaceSkills.map((s) => s.skillId));

  // Add skill from catalog into workspace
  const handleAddFromCatalog = async (catalogItem: CatalogSkill) => {
    if (activeSkillIds.has(catalogItem._id)) {
      toast.info(`${catalogItem.name} is already in your skills arsenal`);
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/skills`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          skillId: catalogItem._id,
          proficiency: 85,
          featured: workspaceSkills.length < 6,
          order: workspaceSkills.length + 1
        }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to add skill');

      setWorkspaceSkills((prev) => [...prev, json.data]);
      toast.success(`Added ${catalogItem.name} to your arsenal! 🎉`);
    } catch (err: any) {
      toast.error(err.message || 'Could not add skill');
    }
  };

  // Update proficiency or featured toggle
  const handleUpdateSkill = async (id: string, updates: Partial<WorkspaceSkill>) => {
    // Check if user is attempting to feature more than 6 skills
    if (updates.featured === true) {
      const currentFeaturedCount = workspaceSkills.filter(
        (s) => s.featured && s._id !== id
      ).length;
      if (currentFeaturedCount >= 6) {
        toast.error('Maximum of 6 featured skills allowed for the homepage marquee. Please unfeature another skill first.');
        return;
      }
    }

    // Optimistic UI update
    setWorkspaceSkills((prev) =>
      prev.map((s) => (s._id === id ? { ...s, ...updates } : s))
    );

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/skills/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save update');
      loadData(); // Revert on failure
    }
  };

  // Remove skill
  const handleRemoveSkill = async (id: string, name: string) => {
    // Optimistic UI update
    setWorkspaceSkills((prev) => prev.filter((s) => s._id !== id));

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/skills/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Removal failed');
      }

      toast.success(`Removed ${name} from arsenal`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove skill');
      loadData();
    }
  };

  // Create custom skill modal submit
  const handleCreateCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    setCreatingCustom(true);
    try {
      const apiUrl = getApiUrl();

      // 1. Add to catalog
      const catRes = await fetch(`${apiUrl}/skills/catalog`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: customName.trim(),
          category: customCategory,
          icon: customIcon.trim() || 'FaCode'
        }),
        credentials: 'include'
      });

      const catJson = await catRes.json();
      if (!catRes.ok) throw new Error(catJson.message || 'Failed to add custom skill');

      const savedCatalogItem = catJson.data;

      // 2. Add to user workspace
      await handleAddFromCatalog(savedCatalogItem);

      // Refresh catalog
      setCatalog((prev) => {
        const exists = prev.some((c) => c._id === savedCatalogItem._id);
        return exists ? prev : [...prev, savedCatalogItem];
      });

      setShowCustomModal(false);
      setCustomName('');
      setCustomIcon('');
      toast.success(`Custom technology "${savedCatalogItem.name}" created and added!`);
    } catch (err: any) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setCreatingCustom(false);
    }
  };

  // Filter Catalog Skills for Search Dropdown
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = selectedCatalogCategory === 'All' || item.category === selectedCatalogCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter Workspace Skills for Grid Display
  const filteredWorkspaceSkills = workspaceSkills.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(gridSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(gridSearch.toLowerCase());
    const matchesCategory = selectedGridCategory === 'All' || item.category === selectedGridCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const featuredCount = workspaceSkills.filter((s) => s.featured).length;
  const avgProficiency = workspaceSkills.length > 0
    ? Math.round(workspaceSkills.reduce((acc, s) => acc + (s.proficiency || 0), 0) / workspaceSkills.length)
    : 0;
  const distinctCategories = new Set(workspaceSkills.map((s) => s.category)).size;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-card/40 to-card/10 p-6 rounded-2xl border border-border backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">
              Master Arsenal
            </span>
            <span className="text-xs text-muted-foreground">• Multi-Tenant Architecture</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Technical Skills Arsenal
          </h1>
          <p className="font-sans text-xs md:text-sm text-muted-foreground mt-1">
            Select technologies from the global master catalog and configure proficiencies for your portfolio.
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Custom Skill
        </button>
      </div>

      {/* 2. Interactive Master Catalog Search & Dropdown Combobox */}
      <div className="relative z-30" ref={dropdownRef}>
        <div className="bg-card/75 border border-border/80 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Quick Add From Master Technology Library ({catalog.length} Available)
            </label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {workspaceSkills.length} selected
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <input
              type="text"
              value={catalogSearch}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setCatalogSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Search technologies to add (e.g. React, Docker, Python, Figma, PostgreSQL)..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background/80 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            {catalogSearch ? (
              <button
                onClick={() => setCatalogSearch('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Category Filter Pills for Catalog */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['All', 'Languages', 'Frameworks & Libraries', 'Databases', 'DevOps & Cloud', 'Tools & Platforms', 'UI/UX & Design', 'AI & Machine Learning'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCatalogCategory(cat);
                  setIsDropdownOpen(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedCatalogCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40'
                }`}
              >
                {cat === 'Frameworks & Libraries' ? 'Frameworks' : cat === 'DevOps & Cloud' ? 'DevOps' : cat === 'Tools & Platforms' ? 'Tools' : cat === 'UI/UX & Design' ? 'UI/UX' : cat === 'AI & Machine Learning' ? 'AI' : cat}
              </button>
            ))}
          </div>

          {/* Floating Dropdown Results Popover */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border/50 flex justify-between items-center text-[11px] font-semibold text-muted-foreground">
                <span>Select technology to add to your workspace</span>
                <span>{filteredCatalog.length} matching items</span>
              </div>

              <div className="overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-72">
                {filteredCatalog.length === 0 ? (
                  <div className="col-span-full py-8 text-center space-y-3">
                    <p className="text-xs text-muted-foreground">
                      No matching technology found for "{catalogSearch}"
                    </p>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setCustomName(catalogSearch);
                        setShowCustomModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold border border-primary/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add "{catalogSearch}" as Custom Skill
                    </button>
                  </div>
                ) : (
                  filteredCatalog.map((item) => {
                    const isAdded = activeSkillIds.has(item._id);
                    const colorScheme = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other'];

                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleAddFromCatalog(item)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isAdded
                            ? 'bg-primary/5 border-primary/30 text-muted-foreground cursor-default'
                            : 'bg-card/60 hover:bg-muted/60 border-border/50 hover:border-primary/50 text-foreground hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/50 shrink-0">
                            {getSkillIcon(item.icon)}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{item.category}</p>
                          </div>
                        </div>

                        {isAdded ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-bold shrink-0">
                            <Check className="w-3 h-3" /> Added
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-bold shrink-0 hover:bg-primary hover:text-white transition-colors">
                            + Add
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Live Stats Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/40 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Skills</p>
            <p className="text-xl font-extrabold text-foreground font-mono">{workspaceSkills.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/40 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Marquee Featured</p>
            <p className="text-xl font-extrabold text-amber-400 font-mono">{featuredCount} / 6</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/40 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Avg Proficiency</p>
            <p className="text-xl font-extrabold text-cyan-400 font-mono">{avgProficiency}%</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/40 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Categories</p>
            <p className="text-xl font-extrabold text-purple-400 font-mono">{distinctCategories}</p>
          </div>
        </div>
      </div>

      {/* 4. Active Skills Filter & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {['All', ...ALL_CATEGORIES].map((cat) => {
            const count = cat === 'All' 
              ? workspaceSkills.length 
              : workspaceSkills.filter((s) => s.category === cat).length;

            if (count === 0 && cat !== 'All') return null;

            return (
              <button
                key={cat}
                onClick={() => setSelectedGridCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedGridCategory === cat
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                <span>{cat === 'Frameworks & Libraries' ? 'Frameworks' : cat === 'DevOps & Cloud' ? 'DevOps' : cat === 'Tools & Platforms' ? 'Tools' : cat === 'UI/UX & Design' ? 'UI/UX' : cat === 'AI & Machine Learning' ? 'AI' : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedGridCategory === cat ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={gridSearch}
            onChange={(e) => setGridSearch(e.target.value)}
            placeholder="Search active skills..."
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-border bg-card/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          {gridSearch && (
            <button onClick={() => setGridSearch('')} className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Eye-Catching Interactive Skills Grid */}
      {loading ? (
        <div className="p-24 flex flex-col justify-center items-center gap-3 text-muted-foreground text-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>Loading Technical Skills Arsenal...</span>
        </div>
      ) : workspaceSkills.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-border/70 rounded-2xl bg-card/20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-display text-lg font-bold text-foreground">No Skills Added Yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select technologies from the search box above or create a custom skill to display in your portfolio.
            </p>
          </div>
        </div>
      ) : filteredWorkspaceSkills.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground text-xs font-semibold bg-card/20 rounded-xl border border-border/50">
          No active skills found matching "{gridSearch}" in {selectedGridCategory}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWorkspaceSkills.map((skill) => {
            const colorScheme = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS['Other'];
            const proficiencyLevel = skill.proficiency >= 85 ? 'Expert' : skill.proficiency >= 70 ? 'Proficient' : skill.proficiency >= 50 ? 'Intermediate' : 'Familiar';

            return (
              <div
                key={skill._id}
                className={`group relative rounded-2xl border border-border/70 bg-gradient-to-b ${colorScheme.glow} to-card/50 p-5 shadow-lg backdrop-blur-md transition-all duration-300 ${colorScheme.border} hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-0.5 flex flex-col justify-between`}
              >
                {/* Card Top: Icon, Titles, Star & Delete Actions */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-background/90 border border-border/80 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getSkillIcon(skill.icon)}
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-foreground leading-tight tracking-tight">
                          {skill.name}
                        </h3>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${colorScheme.badge}`}>
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Featured Star Toggle */}
                      <button
                        type="button"
                        onClick={() => handleUpdateSkill(skill._id, { featured: !skill.featured })}
                        title={skill.featured ? 'Featured in Homepage Marquee' : 'Click to feature in Marquee'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          skill.featured
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/20'
                            : 'bg-muted/40 border-border/40 text-muted-foreground/40 hover:text-amber-400 hover:border-amber-500/30'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${skill.featured ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill._id, skill.name)}
                        title="Remove from arsenal"
                        className="p-1.5 rounded-lg border border-border/40 bg-muted/40 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors opacity-60 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Interactive Proficiency Slider */}
                <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Proficiency: <span className={colorScheme.text}>{proficiencyLevel}</span>
                    </span>
                    <span className="font-mono font-extrabold text-foreground text-xs">
                      {skill.proficiency}%
                    </span>
                  </div>

                  {/* Range Slider */}
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={skill.proficiency}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWorkspaceSkills((prev) =>
                          prev.map((s) => (s._id === skill._id ? { ...s, proficiency: val } : s))
                        );
                      }}
                      onMouseUp={(e) => handleUpdateSkill(skill._id, { proficiency: Number((e.target as HTMLInputElement).value) })}
                      onTouchEnd={(e) => handleUpdateSkill(skill._id, { proficiency: Number((e.target as HTMLInputElement).value) })}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                    />
                  </div>

                  {/* Visual Bar Track Indicator */}
                  <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        skill.proficiency >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                        skill.proficiency >= 70 ? 'bg-gradient-to-r from-primary to-cyan-400' :
                        skill.proficiency >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-slate-500 to-slate-400'
                      }`}
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Modal to Add Custom Skill to Master Catalog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center bg-muted/40 px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-display text-base font-bold text-foreground">
                  Add Custom Technology to Catalog
                </h2>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomSkill} className="p-6 space-y-4 text-left">
              <p className="text-xs text-muted-foreground">
                Add unlisted frameworks, libraries, or tools. It will be added to the global catalog and linked to your workspace.
              </p>

              {/* Skill Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Technology / Skill Name *
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Solidity, Supabase, Blender, Three.js"
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Category *
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon Tag */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  React Icon Identifier (Optional)
                </label>
                <input
                  type="text"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder="e.g. SiReact, FaCode, FaRobot, FaServer"
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                />
                <span className="text-[10px] text-muted-foreground">
                  Defaults to generic code icon if not specified.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-border/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCustom}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
                >
                  {creatingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add & Link Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

