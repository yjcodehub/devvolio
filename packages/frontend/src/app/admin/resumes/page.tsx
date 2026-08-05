'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Upload, Trash, FileText, CheckCircle, Loader2, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';
import ResumeReviewModal from '@/components/admin/ResumeReviewModal';

interface ResumeItem {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  resourceType?: 'raw' | 'image';
  isActive: boolean;
  parsingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
  aiParsingResultId?: string;
  createdAt: string;
}

export default function ResumesAdmin() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Review State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeParsingResult, setActiveParsingResult] = useState<any>(null);

  const apiUrl = getApiUrl();

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/resumes`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch resumes');
      
      const sorted = (data.data || []).sort((a: ResumeItem, b: ResumeItem) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setResumes(sorted);
    } catch (err: any) {
      toast.error(err.message || 'Could not load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('Only PDF, DOC, and DOCX formats are supported.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch(`${apiUrl}/resumes/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      toast.success('Resume uploaded successfully!');
      fetchResumes();
    } catch (err: any) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleParseResume = async (id: string) => {
    setParsingId(id);
    try {
      const res = await fetch(`${apiUrl}/resumes/parse/${id}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI Parsing failed');

      toast.success('Resume extracted! Opening manual review screen...');
      setActiveResumeId(id);
      setActiveParsingResult(data.data);
      setIsModalOpen(true);
      fetchResumes();
    } catch (err: any) {
      toast.error(err.message || 'AI Parsing failed');
    } finally {
      setParsingId(null);
    }
  };

  const handleReviewExisting = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/resumes/parse-result/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No parsing result found');

      setActiveResumeId(id);
      setActiveParsingResult(data.data);
      setIsModalOpen(true);
    } catch (err: any) {
      toast.error('Parse result not found. Run "Parse with AI" first.');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/resumes/${id}/activate`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to activate resume');

      toast.success('Resume activated successfully.');
      fetchResumes();
    } catch (err: any) {
      toast.error(err.message || 'Activation failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the resume "${name}"?`)) return;

    try {
      const res = await fetch(`${apiUrl}/resumes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete resume');

      toast.success('Resume deleted successfully.');
      fetchResumes();
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">AI Resume Auto-Importer</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Upload resumes to automatically extract and map hero, about, experience, skills, and projects with AI.
          </p>
        </div>
        <button
          onClick={fetchResumes}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all hover-glow-trigger"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border bg-card/30 p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Upload New Resume</h2>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/45 hover:bg-card/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-foreground">Uploading to Cloud Storage...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-full bg-muted/65 w-fit mx-auto border border-border">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-muted-foreground">PDF, DOCX, or DOC formats (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/20 p-5 text-xs text-muted-foreground space-y-2 leading-relaxed">
            <p className="font-bold text-foreground mb-1">🤖 AI Auto-Import Steps:</p>
            <p>1. Upload a PDF/DOCX resume file.</p>
            <p>2. Click <strong>Parse with AI</strong> to extract structured details.</p>
            <p>3. Review confidence scores on the <strong>Manual Correction Screen</strong> and apply data to your portfolio.</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border bg-card/30 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
              <h2 className="text-base font-bold text-foreground">Uploaded CV Archives & AI Parsing</h2>
            </div>

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">Retrieving archives...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto opacity-45" />
                <p className="text-sm font-semibold text-foreground">No resumes uploaded yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Drag and drop your CV file on the upload area to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/15 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-6 py-3.5">Filename</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {resumes.map((resume) => (
                      <tr
                        key={resume._id}
                        className={`hover:bg-card/20 transition-colors ${
                          resume.isActive ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4 max-w-[200px] truncate font-semibold text-foreground">
                          {resume.fileName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded border uppercase text-[10px] font-bold bg-muted/40 border-border">
                            {resume.fileType}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {resume.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-500">
                              <CheckCircle className="w-3 h-3" />
                              Active CV
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-muted/50 border border-border/40 text-[10px] font-bold text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {/* AI Parse Button */}
                          {parsingId === resume._id ? (
                            <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/20 text-primary text-[10px] font-bold">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Parsing AI...
                            </button>
                          ) : resume.aiParsingResultId ? (
                            <button
                              onClick={() => handleReviewExisting(resume._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition-all"
                            >
                              <Sparkles className="w-3 h-3" />
                              Review AI Data
                            </button>
                          ) : (
                            <button
                              onClick={() => handleParseResume(resume._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold transition-all"
                            >
                              <Sparkles className="w-3 h-3" />
                              Parse with AI
                            </button>
                          )}

                          <a
                            href={
                              resume.fileType === 'pdf'
                                ? resume.fileUrl
                                : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(resume.fileUrl)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-[10px] font-bold text-foreground hover:bg-muted/40 transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>

                          {!resume.isActive && (
                            <button
                              onClick={() => handleActivate(resume._id)}
                              className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-[10px] font-bold text-white transition-all"
                            >
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(resume._id, resume.fileName)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Correction Review Modal */}
      {activeResumeId && activeParsingResult && (
        <ResumeReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          resumeId={activeResumeId}
          parsingResult={activeParsingResult}
          onSuccess={fetchResumes}
        />
      )}
    </div>
  );
}
