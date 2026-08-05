'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Loader2
} from 'lucide-react';

interface ResumeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  parsingResult: any;
  onSuccess: () => void;
}

export default function ResumeReviewModal({
  isOpen,
  onClose,
  resumeId,
  parsingResult,
  onSuccess
}: ResumeReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'experiences' | 'skills' | 'projects'>('hero');
  const [submitting, setSubmitting] = useState(false);
  const [parsedData, setParsedData] = useState<any>(parsingResult?.rawJson || {});
  const [selectedSections, setSelectedSections] = useState({
    hero: true,
    about: true,
    experiences: true,
    skills: true,
    projects: true
  });

  if (!isOpen || !parsingResult) return null;

  const confidence = parsingResult.confidenceScores || {};
  const duplicates = parsingResult.duplicatesDetected || [];

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 0.5) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const handleApplyData = async () => {
    setSubmitting(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/resumes/apply-parsed/${parsingResult._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedSections,
          data: parsedData
        }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to apply parsed data');

      toast.success('Extracted AI data applied to portfolio collections!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply data');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">AI Resume Review & Manual Correction</h2>
              <p className="text-xs text-muted-foreground">Review extracted fields and confidence scores before applying</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Overall Score Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreColor(confidence.overall || 0)}`}>
              Score: {Math.round((confidence.overall || 0) * 100)}% Confidence
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Duplicate Warning Callout */}
        {duplicates.length > 0 && (
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3 text-xs text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Potential Duplicates Detected:</strong> {duplicates.length} item(s) match existing records in your portfolio.
            </span>
          </div>
        )}

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          
          {/* Left Column: Section Selector */}
          <div className="p-4 space-y-2 bg-card/20 overflow-y-auto">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Sections Mapped</p>
            
            {[
              { id: 'hero', label: 'Hero Header', icon: User, score: confidence.hero },
              { id: 'about', label: 'About & Bio', icon: FileText, score: confidence.about },
              { id: 'experiences', label: 'Experiences', icon: Briefcase, score: confidence.experience },
              { id: 'skills', label: 'Skills', icon: Wrench, score: confidence.skills },
              { id: 'projects', label: 'Projects', icon: FolderGit2, score: confidence.projects }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id as any)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === sec.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={(selectedSections as any)[sec.id]}
                    onChange={(e) => setSelectedSections({ ...selectedSections, [sec.id]: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                  />
                  <sec.icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getScoreColor(sec.score || 0)}`}>
                  {Math.round((sec.score || 0) * 100)}%
                </span>
              </button>
            ))}
          </div>

          {/* Right Column: Tabbed Data Editor */}
          <div className="md:col-span-3 p-6 overflow-y-auto space-y-4">
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Hero Section Configuration</h3>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Title</label>
                  <input
                    type="text"
                    value={parsedData.hero?.title || ''}
                    onChange={(e) => setParsedData({ ...parsedData, hero: { ...parsedData.hero, title: e.target.value } })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card/60 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Subtitle</label>
                  <input
                    type="text"
                    value={parsedData.hero?.subtitle || ''}
                    onChange={(e) => setParsedData({ ...parsedData, hero: { ...parsedData.hero, subtitle: e.target.value } })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card/60 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Tagline</label>
                  <textarea
                    rows={2}
                    value={parsedData.hero?.tagline || ''}
                    onChange={(e) => setParsedData({ ...parsedData, hero: { ...parsedData.hero, tagline: e.target.value } })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card/60 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">About Me Bio</h3>
                <textarea
                  rows={5}
                  value={parsedData.about?.bio || ''}
                  onChange={(e) => setParsedData({ ...parsedData, about: { ...parsedData.about, bio: e.target.value } })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card/60 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {activeTab === 'experiences' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Work Experiences ({parsedData.experiences?.length || 0})</h3>
                {parsedData.experiences?.map((exp: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-border bg-card/40 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.role || ''}
                        placeholder="Role"
                        onChange={(e) => {
                          const updated = [...parsedData.experiences];
                          updated[idx].role = e.target.value;
                          setParsedData({ ...parsedData, experiences: updated });
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card/60"
                      />
                      <input
                        type="text"
                        value={exp.company || ''}
                        placeholder="Company"
                        onChange={(e) => {
                          const updated = [...parsedData.experiences];
                          updated[idx].company = e.target.value;
                          setParsedData({ ...parsedData, experiences: updated });
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card/60"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      placeholder="Description"
                      onChange={(e) => {
                        const updated = [...parsedData.experiences];
                        updated[idx].description = e.target.value;
                        setParsedData({ ...parsedData, experiences: updated });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card/60"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Extracted Skills ({parsedData.skills?.length || 0})</h3>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills?.map((sk: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border bg-card/60 text-xs font-medium">
                      {sk.name} ({sk.proficiency || 85}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Extracted Projects ({parsedData.projects?.length || 0})</h3>
                {parsedData.projects?.map((proj: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-border bg-card/40 space-y-2">
                    <input
                      type="text"
                      value={proj.title || ''}
                      placeholder="Project Title"
                      onChange={(e) => {
                        const updated = [...parsedData.projects];
                        updated[idx].title = e.target.value;
                        setParsedData({ ...parsedData, projects: updated });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card/60 font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={proj.description || ''}
                      placeholder="Description"
                      onChange={(e) => {
                        const updated = [...parsedData.projects];
                        updated[idx].description = e.target.value;
                        setParsedData({ ...parsedData, projects: updated });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card/60"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancel & Discard
          </button>

          <button
            onClick={handleApplyData}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-semibold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying Selected Sections...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Apply Selected Data to Portfolio
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
