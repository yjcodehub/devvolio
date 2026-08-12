'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Trash, ArrowUp, ArrowDown, Save, Loader2, 
  Terminal, User, Monitor, Layers, Database, Globe, Sliders, Music, Award, Github, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl, getAuthHeaders } from '@/utils/api';
import DomainSettingsTab from '@/components/admin/DomainSettingsTab';

interface TerminalStep {
  type: 'input' | 'output';
  text: string;
}

interface ExpertiseItem {
  icon: string;
  title: string;
  desc: string;
}

type TabType = 'hero' | 'about' | 'stats' | 'contact' | 'domains';

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Portfolio settings data
  const [portfolioData, setPortfolioData] = useState<any>(null);

  // Hero Section States
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroTagline, setHeroTagline] = useState('');
  const [terminalSequence, setTerminalSequence] = useState<TerminalStep[]>([]);

  // About Section States
  const [aboutBio, setAboutBio] = useState('');
  const [expertises, setExpertises] = useState<ExpertiseItem[]>([]);

  // Stats Section States
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeEasySolved, setLeetcodeEasySolved] = useState<number>(0);
  const [leetcodeEasyTotal, setLeetcodeEasyTotal] = useState<number>(0);
  const [leetcodeMediumSolved, setLeetcodeMediumSolved] = useState<number>(0);
  const [leetcodeMediumTotal, setLeetcodeMediumTotal] = useState<number>(0);
  const [leetcodeHardSolved, setLeetcodeHardSolved] = useState<number>(0);
  const [leetcodeHardTotal, setLeetcodeHardTotal] = useState<number>(0);
  const [spotifyIsPlaying, setSpotifyIsPlaying] = useState<boolean>(false);
  const [spotifyTrackTitle, setSpotifyTrackTitle] = useState('');
  const [spotifyTrackArtist, setSpotifyTrackArtist] = useState('');

  // Contact Section States
  const [contactTitle, setContactTitle] = useState('');
  const [contactSubtitle, setContactSubtitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const apiUrl = getApiUrl();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/settings`, { headers: getAuthHeaders(), credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.success) {
        const data = json.data;
        setPortfolioData(data);
        setHeroTitle(data.hero?.title || '');
        setHeroSubtitle(data.hero?.subtitle || '');
        setHeroTagline(data.hero?.tagline || '');
        setTerminalSequence(data.hero?.terminalSequence || []);
        
        setAboutBio(data.about?.bio || '');
        setExpertises(data.about?.expertises || []);

        const stats = data.stats || {};
        setGithubUsername(stats.githubUsername || '');
        setLeetcodeEasySolved(stats.leetcodeEasySolved ?? 142);
        setLeetcodeEasyTotal(stats.leetcodeEasyTotal ?? 200);
        setLeetcodeMediumSolved(stats.leetcodeMediumSolved ?? 210);
        setLeetcodeMediumTotal(stats.leetcodeMediumTotal ?? 450);
        setLeetcodeHardSolved(stats.leetcodeHardSolved ?? 38);
        setLeetcodeHardTotal(stats.leetcodeHardTotal ?? 150);
        setSpotifyIsPlaying(stats.spotifyIsPlaying ?? false);
        setSpotifyTrackTitle(stats.spotifyTrackTitle || '');
        setSpotifyTrackArtist(stats.spotifyTrackArtist || '');

        const contact = data.contact || {};
        setContactTitle(contact.title || '');
        setContactSubtitle(contact.subtitle || '');
        setContactEmail(contact.email || '');
      } else {
        toast.error('Failed to load global website settings');
      }
    } catch (err) {
      toast.error('Connection error while fetching settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const addTerminalStep = () => {
    setTerminalSequence([...terminalSequence, { type: 'input', text: '' }]);
  };

  const removeTerminalStep = (idx: number) => {
    setTerminalSequence(terminalSequence.filter((_, i) => i !== idx));
  };

  const updateTerminalStep = (idx: number, field: keyof TerminalStep, value: string) => {
    const updated = [...terminalSequence];
    updated[idx] = { ...updated[idx], [field]: value };
    setTerminalSequence(updated);
  };

  const moveTerminalStep = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === terminalSequence.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...terminalSequence];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setTerminalSequence(updated);
  };

  const addExpertise = () => {
    setExpertises([...expertises, { icon: 'monitor', title: '', desc: '' }]);
  };

  const removeExpertise = (idx: number) => {
    setExpertises(expertises.filter((_, i) => i !== idx));
  };

  const updateExpertise = (idx: number, field: keyof ExpertiseItem, value: string) => {
    const updated = [...expertises];
    updated[idx] = { ...updated[idx], [field]: value };
    setExpertises(updated);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle,
          tagline: heroTagline,
          terminalSequence: terminalSequence.filter(step => step.text.trim() !== '')
        },
        about: {
          bio: aboutBio,
          expertises: expertises.filter(exp => exp.title.trim() !== '')
        },
        stats: {
          githubUsername,
          leetcodeEasySolved: Number(leetcodeEasySolved),
          leetcodeEasyTotal: Number(leetcodeEasyTotal),
          leetcodeMediumSolved: Number(leetcodeMediumSolved),
          leetcodeMediumTotal: Number(leetcodeMediumTotal),
          leetcodeHardSolved: Number(leetcodeHardSolved),
          leetcodeHardTotal: Number(leetcodeHardTotal),
          spotifyIsPlaying,
          spotifyTrackTitle,
          spotifyTrackArtist
        },
        contact: {
          title: contactTitle,
          subtitle: contactSubtitle,
          email: contactEmail
        }
      };

      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Website page settings updated successfully');
        fetchSettings();
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
        <p className="text-sm text-muted-foreground font-semibold">Retrieving page settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-left flex justify-between items-center border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="w-7 h-7 text-primary" />
            Page Settings
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Configure dynamic content, subdomains (devvolio.in), custom domains, and widgets.
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
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap border-b border-border/50 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display font-bold text-sm transition-all ${
            activeTab === 'hero'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Hero Welcome & Terminal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display font-bold text-sm transition-all ${
            activeTab === 'about'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4" />
          About Section & Expertises
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display font-bold text-sm transition-all ${
            activeTab === 'stats'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Developer Metrics (Stats)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display font-bold text-sm transition-all ${
            activeTab === 'contact'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="w-4 h-4" />
          Contact Section
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('domains')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display font-bold text-sm transition-all ${
            activeTab === 'domains'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Subdomains & Domains
        </button>
      </div>

      {activeTab === 'domains' ? (
        <DomainSettingsTab
          subdomain={portfolioData?.workspace?.slug || 'yash'}
          customDomain={portfolioData?.customDomain || ''}
          domainStatus={portfolioData?.domainStatus || 'pending'}
          onUpdated={fetchSettings}
        />
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 text-left">
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Hero Section Text</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="heroSubtitle" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Badge Subtitle / Role Tag
                    </label>
                    <input
                      type="text"
                      id="heroSubtitle"
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="e.g. Frontend & POS Software Architect"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="heroTitle" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Hero Main Title
                    </label>
                    <input
                      type="text"
                      id="heroTitle"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="e.g. Engineering Premium Digital Experiences."
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="heroTagline" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Hero Tagline / Description
                  </label>
                  <textarea
                    id="heroTagline"
                    value={heroTagline}
                    onChange={(e) => setHeroTagline(e.target.value)}
                    placeholder="I build high-performance POS platforms..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">Interactive Terminal Sequence</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define the sequence of inputs typed and outputs shown in the interactive terminal widget.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTerminalStep}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Step
                  </button>
                </div>

                {terminalSequence.length === 0 ? (
                  <div className="text-center py-10 rounded-lg border border-dashed border-border/50 text-muted-foreground text-xs">
                    No sequence steps created yet. Click "Add Step" to configure terminal commands.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {terminalSequence.map((step, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card/35 backdrop-blur-sm"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveTerminalStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTerminalStep(idx, 'down')}
                            disabled={idx === terminalSequence.length - 1}
                            className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="w-28 shrink-0">
                          <select
                            value={step.type}
                            onChange={(e) => updateTerminalStep(idx, 'type', e.target.value as 'input' | 'output')}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary/65"
                          >
                            <option value="input">Input (Type)</option>
                            <option value="output">Output (Inst)</option>
                          </select>
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={step.text}
                            onChange={(e) => updateTerminalStep(idx, 'text', e.target.value)}
                            placeholder={step.type === 'input' ? 'e.g. yash --status' : 'e.g. > Immediate Joiner'}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary/65 font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeTerminalStep(idx)}
                          className="p-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">About Description</h2>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="aboutBio" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Biography Bio Overview
                  </label>
                  <textarea
                    id="aboutBio"
                    value={aboutBio}
                    onChange={(e) => setAboutBio(e.target.value)}
                    placeholder="6+ years of engineering operational software..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">Core Expertises</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure the specialty expertise cards shown on the public about section.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addExpertise}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Card
                  </button>
                </div>

                {expertises.length === 0 ? (
                  <div className="text-center py-10 rounded-lg border border-dashed border-border/50 text-muted-foreground text-xs">
                    No expertises added yet. Click "Add Card" to define core expertise blocks.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expertises.map((exp, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-xl border border-border/60 bg-card/35 backdrop-blur-sm space-y-4 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-primary">Card #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeExpertise(idx)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              Card Icon
                            </label>
                            <select
                              value={exp.icon}
                              onChange={(e) => updateExpertise(idx, 'icon', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary/65"
                            >
                              <option value="monitor">Monitor (POS/Web)</option>
                              <option value="layers">Layers (SaaS/CRM)</option>
                              <option value="database">Database (Backend/Fullstack)</option>
                              <option value="globe">Globe (Instruction/General)</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              Expertise Title
                            </label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => updateExpertise(idx, 'title', e.target.value)}
                              placeholder="e.g. POS & Restaurant Tech"
                              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary/65 font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Description Details
                          </label>
                          <textarea
                            value={exp.desc}
                            onChange={(e) => updateExpertise(idx, 'desc', e.target.value)}
                            placeholder="e.g. Deep specialization in restaurant billing systems..."
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary/65 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Github className="w-5 h-5 text-primary" />
                  GitHub Configuration
                </h2>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="githubUsername" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    id="githubUsername"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. yjcodehub"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary" />
                  LeetCode Performance Matrix
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3 p-4 rounded-lg bg-card/40 border border-border/50">
                    <span className="text-xs font-bold text-emerald-500">Easy Solved</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={leetcodeEasySolved}
                        onChange={(e) => setLeetcodeEasySolved(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                        placeholder="Solved"
                      />
                      <span className="self-center text-muted-foreground">/</span>
                      <input
                        type="number"
                        value={leetcodeEasyTotal}
                        onChange={(e) => setLeetcodeEasyTotal(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                        placeholder="Total"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-lg bg-card/40 border border-border/50">
                    <span className="text-xs font-bold text-amber-500">Medium Solved</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={leetcodeMediumSolved}
                        onChange={(e) => setLeetcodeMediumSolved(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                        placeholder="Solved"
                      />
                      <span className="self-center text-muted-foreground">/</span>
                      <input
                        type="number"
                        value={leetcodeMediumTotal}
                        onChange={(e) => setLeetcodeMediumTotal(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                        placeholder="Total"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-lg bg-card/40 border border-border/50">
                    <span className="text-xs font-bold text-red-500">Hard Solved</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={leetcodeHardSolved}
                        onChange={(e) => setLeetcodeHardSolved(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                        placeholder="Solved"
                      />
                      <span className="self-center text-muted-foreground">/</span>
                      <input
                        type="number"
                        value={leetcodeHardTotal}
                        onChange={(e) => setLeetcodeHardTotal(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                        placeholder="Total"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Music className="w-5 h-5 text-emerald-500" />
                  Spotify Simulated Status
                </h2>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="spotifyIsPlaying"
                    checked={spotifyIsPlaying}
                    onChange={(e) => setSpotifyIsPlaying(e.target.checked)}
                    className="rounded border-border bg-card text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer"
                  />
                  <label htmlFor="spotifyIsPlaying" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                    Simulate "Now Playing" Active Status
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="spotifyTrackTitle" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Track Title
                    </label>
                    <input
                      type="text"
                      id="spotifyTrackTitle"
                      value={spotifyTrackTitle}
                      onChange={(e) => setSpotifyTrackTitle(e.target.value)}
                      placeholder="e.g. Chill Vibes Loop"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="spotifyTrackArtist" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Track Artist / Playlist Description
                    </label>
                    <input
                      type="text"
                      id="spotifyTrackArtist"
                      value={spotifyTrackArtist}
                      onChange={(e) => setSpotifyTrackArtist(e.target.value)}
                      placeholder="e.g. Yash Jais Studio Mix"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card/15 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Contact Form Settings</h2>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contactTitle" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Contact Form Title
                  </label>
                  <input
                    type="text"
                    id="contactTitle"
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    placeholder="e.g. Let's Collaborate"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contactSubtitle" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Contact Form Description Subtitle
                  </label>
                  <textarea
                    id="contactSubtitle"
                    value={contactSubtitle}
                    onChange={(e) => setContactSubtitle(e.target.value)}
                    placeholder="Have an exciting project or role? Send me a message..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contactEmail" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Target Recipient Email Placeholder
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. lakshraj2121@gmail.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/65 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
