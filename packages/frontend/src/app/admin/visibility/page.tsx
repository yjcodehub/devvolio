'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Trash, Save, Loader2, Sliders, Eye, PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

const CORE_SECTION_KEYS = [
  'skills', 'core', 'contact', 'developerMatrix', 'motionTerminal', 'projects', 'experience',
  'aboutDescription', 'coreExpertise', 'workExperience', 'education', 'githubActivity', 'leetcodeActivity', 'spotifyActivity'
];

const SECTION_GROUPS = [
  {
    title: 'Landing Page Layout',
    description: 'Configure standard top-level landing page standalone sections.',
    keys: [
      { key: 'motionTerminal', label: 'Motion Terminal Section (Interactive Hero Widget)' },
      { key: 'skills', label: 'Skills Section | Technical Arsenal' },
      { key: 'projects', label: 'Projects Section (Grid & Filtering)' },
      { key: 'contact', label: 'Contact Section (Collaboration Form)' }
    ]
  },
  {
    title: 'About Section (Core Details)',
    description: 'Configure the public bio description text and specialties grids.',
    parentKey: 'core',
    parentLabel: 'Core About Section Wrapper',
    keys: [
      { key: 'aboutDescription', label: 'Biography Description Paragraph' },
      { key: 'coreExpertise', label: 'Expertise Spotlight Cards Grid' }
    ]
  },
  {
    title: 'Professional Journey Timeline',
    description: 'Configure active work roles and educational milestone tracks.',
    parentKey: 'experience',
    parentLabel: 'Timeline Section Wrapper',
    keys: [
      { key: 'workExperience', label: 'Work Experience History' },
      { key: 'education', label: 'Education Milestone History' }
    ]
  },
  {
    title: 'Developer Matrix (Metrics Dashboard)',
    description: 'Configure API-driven operational statistics charts.',
    parentKey: 'developerMatrix',
    parentLabel: 'Metrics Section Wrapper',
    keys: [
      { key: 'githubActivity', label: 'GitHub Contributions Calendar Grid' },
      { key: 'leetcodeActivity', label: 'LeetCode Practice Performance Matrix' },
      { key: 'spotifyActivity', label: 'Spotify Track Simulated Now Playing Widget' }
    ]
  }
];

export default function VisibilityManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Section Visibility States
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, { label: string; visible: boolean }>>({});
  const [customKey, setCustomKey] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const apiUrl = getApiUrl();

  // Load current global settings from server
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/settings`, { credentials: 'include' });
        const json = await res.json();
        if (res.ok && json.success) {
          const data = json.data;

          // Section Visibility with dynamic Map fallback
          const defaultVisibility = {
            skills: { label: 'Skills Section | Technical Arsenal', visible: true },
            core: { label: 'Core Section (About & Expertises)', visible: true },
            aboutDescription: { label: 'Biography Description Paragraph', visible: true },
            coreExpertise: { label: 'Expertise Spotlight Cards Grid', visible: true },
            contact: { label: 'Contact Section', visible: true },
            developerMatrix: { label: 'Developer Matrix Section (GitHub, LeetCode, Spotify)', visible: true },
            githubActivity: { label: 'GitHub Contributions Calendar Grid', visible: true },
            leetcodeActivity: { label: 'LeetCode Practice Performance Matrix', visible: true },
            spotifyActivity: { label: 'Spotify Track Simulated Now Playing Widget', visible: true },
            motionTerminal: { label: 'Motion Terminal Section (Interactive Hero Widget)', visible: true },
            projects: { label: 'Projects Section (Grid & Filtering)', visible: true },
            experience: { label: 'Experience & Education Timeline Section', visible: true },
            workExperience: { label: 'Work Experience History', visible: true },
            education: { label: 'Education Milestone History', visible: true }
          };

          // Parse settings map structure
          const loadedVisibility = data.sectionVisibility || {};
          setSectionVisibility({
            ...defaultVisibility,
            ...loadedVisibility
          });
        } else {
          toast.error('Failed to load global website settings');
        }
      } catch (err) {
        toast.error('Connection error while fetching settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiUrl]);

  // Section visibility helpers
  const toggleSection = (key: string) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        visible: !prev[key].visible
      }
    }));
  };

  const handleAddCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedKey = customKey.trim().replace(/\s+/g, '').toLowerCase();
    const sanitizedLabel = customLabel.trim();

    if (!sanitizedKey || !sanitizedLabel) {
      toast.error('Both Key and Label are required for custom section');
      return;
    }

    if (sectionVisibility[sanitizedKey]) {
      toast.error('A section toggle with this key already exists');
      return;
    }

    setSectionVisibility((prev) => ({
      ...prev,
      [sanitizedKey]: {
        label: sanitizedLabel,
        visible: true
      }
    }));

    setCustomKey('');
    setCustomLabel('');
    toast.success(`Custom toggle "${sanitizedLabel}" added! Save configurations to apply.`);
  };

  const handleRemoveCustomSection = (key: string) => {
    setSectionVisibility((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    toast.success('Custom toggle removed. Save configurations to apply.');
  };

  // Submit PUT updates to settings API
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        sectionVisibility
      };

      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Section visibility configuration saved successfully');
      } else {
        toast.error(json.message || 'Failed to save website settings');
      }
    } catch (err) {
      toast.error('Network error. Failed to save website settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Retrieving section settings...</p>
      </div>
    );
  }

  // Filter out custom user-defined sections (not in CORE_SECTION_KEYS)
  const customSections = Object.entries(sectionVisibility).filter(
    ([key]) => !CORE_SECTION_KEYS.includes(key)
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="text-left flex justify-between items-center border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="w-7 h-7 text-primary" />
            Section Visibility
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Configure show/hide states for main sections and individual sub-components.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all shadow-lg shadow-primary/10 disabled:opacity-50 hover-glow-trigger"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Configuration
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8 text-left">
        <div className="space-y-8">
          {/* Loop over groups */}
          {SECTION_GROUPS.map((group, groupIdx) => {
            const hasParent = !!group.parentKey;
            const parentValue = hasParent ? sectionVisibility[group.parentKey!] : null;
            const isParentActive = hasParent ? parentValue?.visible !== false : true;

            return (
              <div 
                key={groupIdx}
                className="rounded-xl border border-border bg-card/10 p-6 space-y-5 transition-all duration-300 hover:border-border/60"
              >
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4 gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      {group.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {group.description}
                    </p>
                  </div>

                  {/* Parent level switch if applicable */}
                  {hasParent && parentValue && (
                    <div className="flex items-center gap-3 bg-card/45 px-4 py-2 rounded-lg border border-border/55">
                      <span className="text-xs font-bold text-foreground">
                        {group.parentLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSection(group.parentKey!)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          parentValue.visible ? 'bg-primary shadow-[0_0_10px_rgba(109,93,252,0.3)]' : 'bg-muted/80'
                        }`}
                        aria-label={`Toggle ${group.parentLabel}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            parentValue.visible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub items layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.keys.map((item) => {
                    const value = sectionVisibility[item.key] || { label: item.label, visible: true };
                    return (
                      <div 
                        key={item.key}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          !isParentActive 
                            ? 'bg-muted/10 border-border/20 opacity-40 select-none' 
                            : 'bg-card/25 border-border hover:border-primary/20'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <span className="text-sm font-bold text-foreground">
                            {value.label}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase">
                            Key: {item.key}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={!isParentActive}
                          onClick={() => toggleSection(item.key)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            !isParentActive 
                              ? 'bg-muted/30 cursor-not-allowed'
                              : value.visible 
                                ? 'bg-primary shadow-[0_0_10px_rgba(109,93,252,0.3)] cursor-pointer' 
                                : 'bg-muted/80 cursor-pointer'
                          }`}
                          aria-label={`Toggle ${value.label}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              value.visible ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Warning helper when parent is off */}
                {!isParentActive && (
                  <p className="text-[10px] text-amber-500 font-semibold italic">
                    * Note: This entire section is currently disabled from the layout by the section wrapper toggle above.
                  </p>
                )}
              </div>
            );
          })}

          {/* Custom user-defined sections */}
          <div className="rounded-xl border border-border bg-card/10 p-6 space-y-5">
            <div className="border-b border-border/30 pb-4">
              <h2 className="font-display text-lg font-bold text-foreground">
                Custom Future Sections
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage visibility of any custom section features you add to the code in the future.
              </p>
            </div>

            {customSections.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-card/10 rounded-xl border border-dashed border-border/60">
                No custom sections registered yet. Build and register them below.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customSections.map(([key, value]) => (
                  <div 
                    key={key} 
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/25 hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      <span className="text-sm font-bold text-foreground">
                        {value.label}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">
                        Key: {key} (Custom Section)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSection(key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          value.visible ? 'bg-primary shadow-[0_0_10px_rgba(109,93,252,0.3)]' : 'bg-muted/80'
                        }`}
                        aria-label={`Toggle ${value.label}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            value.visible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomSection(key)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete custom section toggle"
                      >
                        <Trash className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add custom section toggle */}
          <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-secondary" />
                Add Custom Section Toggle
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure toggles for new sections or features you plan to build in the future.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="customKey" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Unique System Key (alphanumeric, no spaces)
                </label>
                <input
                  type="text"
                  id="customKey"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="e.g. blog"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customLabel" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Display Label (for reference)
                </label>
                <input
                  type="text"
                  id="customLabel"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. Medium Blogs Section"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Add Section Toggle
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
