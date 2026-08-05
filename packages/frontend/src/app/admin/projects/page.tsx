'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Pencil, Trash, Github, Globe, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  detailedBody?: string;
  thumbnail: string;
  githubUrl?: string;
  liveUrl?: string;
  technologies: string[];
  category: 'Frontend' | 'Full Stack' | 'SaaS' | 'Other';
  featured: boolean;
  order: number;
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedBody, setDetailedBody] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [category, setCategory] = useState<'Frontend' | 'Full Stack' | 'SaaS' | 'Other'>('Frontend');
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProjects = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/projects`);
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDetailedBody('');
    setThumbnail('');
    setGithubUrl('');
    setLiveUrl('');
    setTechnologiesText('');
    setCategory('Frontend');
    setFeatured(false);
    setOrder(0);
    setEditingId(null);
  };

  const handleEditClick = (project: Project) => {
    setEditingId(project._id);
    setTitle(project.title);
    setDescription(project.description);
    setDetailedBody(project.detailedBody || '');
    setThumbnail(project.thumbnail);
    setGithubUrl(project.githubUrl || '');
    setLiveUrl(project.liveUrl || '');
    setTechnologiesText(project.technologies.join(', '));
    setCategory(project.category);
    setFeatured(project.featured);
    setOrder(project.order);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'portfolio/thumbnails');

    setUploadingImage(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/media/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include' // transmit session cookies
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setThumbnail(data.data.url);
      toast.success('Thumbnail uploaded successfully to Cloudinary');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !description || !thumbnail || !technologiesText) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      title,
      description,
      detailedBody,
      thumbnail,
      githubUrl: githubUrl || undefined,
      liveUrl: liveUrl || undefined,
      technologies: technologiesText.split(',').map((t) => t.trim()).filter(Boolean),
      category,
      featured,
      order: Number(order)
    };

    try {
      const apiUrl = getApiUrl();
      const url = editingId ? `${apiUrl}/projects/${editingId}` : `${apiUrl}/projects`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Save operation failed');

      toast.success(editingId ? 'Project updated successfully' : 'Project created successfully');
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project case study?')) return;

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Delete operation failed');

      toast.success('Project removed successfully');
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header controls */}
      <div className="flex justify-between items-center w-full">
        <div className="text-left">
          <h1 className="font-display text-2xl font-bold text-foreground">Projects Manager</h1>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">Create, edit, and delete featured project cards.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-semibold hover-glow-trigger transition-all"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border border-border bg-card/30 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading projects list...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No projects found in database. Click Add Project to create one.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Thumbnail</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <img src={proj.thumbnail} alt={proj.title} className="w-12 h-8 object-cover rounded border border-border" />
                    </td>
                    <td className="p-4 font-bold text-foreground">{proj.title}</td>
                    <td className="p-4 text-primary font-bold uppercase text-[10px]">{proj.category}</td>
                    <td className="p-4 font-mono font-semibold">{proj.order}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${proj.featured ? 'bg-secondary/15 text-secondary border border-secondary/10' : 'bg-muted/65 text-muted-foreground'}`}>
                        {proj.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleEditClick(proj)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Project"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj._id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Project"
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
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-muted/40 px-6 py-4 border-b border-border/50">
              <h2 className="font-display text-lg font-bold text-foreground">
                {editingId ? 'Edit Project Details' : 'Add New Project'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} data-lenis-prevent className="p-6 overflow-y-auto space-y-5 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Project Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="FitPulse Pro"
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
                    <option value="Frontend">Frontend</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Short Summary *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mobile-first BMI tracking..."
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Detailed Markdown Body */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Detailed Case Study (Markdown)</label>
                <textarea
                  value={detailedBody}
                  onChange={(e) => setDetailedBody(e.target.value)}
                  rows={4}
                  placeholder="# Case Study Outline..."
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              {/* Technologies */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Technologies (comma-separated) *</label>
                <input
                  type="text"
                  value={technologiesText}
                  onChange={(e) => setTechnologiesText(e.target.value)}
                  placeholder="Next.js, Tailwind CSS, Node.js"
                  className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Image upload thumbnail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Project Thumbnail URL *</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                    required
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="upload-thumbnail"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      accept="image/*"
                    />
                    <label
                      htmlFor="upload-thumbnail"
                      className="px-3 py-2 rounded-lg border border-border hover:border-foreground/30 bg-muted/50 text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Upload File
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Github Link */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Live Link */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Live Deployment URL</label>
                  <input
                    type="text"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://..."
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Order */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Sorting Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="feat"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-card text-primary focus:ring-primary"
                  />
                  <label htmlFor="feat" className="text-xs font-bold text-foreground select-none cursor-pointer">
                    Featured Project
                  </label>
                </div>
              </div>

              {/* Modal footer submit buttons */}
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
                  {editingId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
