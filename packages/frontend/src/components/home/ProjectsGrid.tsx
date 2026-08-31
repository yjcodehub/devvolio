'use client';

import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Globe, Search, Filter, FolderPlus } from 'lucide-react';

interface Project {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  githubUrl?: string;
  liveUrl?: string;
  technologies: string[];
  category: 'Frontend' | 'Full Stack' | 'SaaS' | 'Other';
  featured: boolean;
  order: number;
}

interface ProjectsGridProps {
  projects: Project[];
}

const sampleProjects: Project[] = [
  {
    title: 'SaaS Developer Workspace (Sample)',
    slug: 'saas-developer-workspace-sample',
    description: 'Cloud-based developer portfolio and analytics suite with multi-tenant custom domains and live workspace metrics.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    githubUrl: 'https://github.com',
    liveUrl: 'https://devvolio.in',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    category: 'SaaS',
    featured: true,
    order: 1
  },
  {
    title: 'AI Content Engine (Sample)',
    slug: 'ai-content-generator-sample',
    description: 'High-performance AI workflow platform for automated technical documentation, code analysis, and interactive summaries.',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    githubUrl: 'https://github.com',
    liveUrl: 'https://devvolio.in',
    technologies: ['React', 'Node.js', 'OpenAI API', 'MongoDB'],
    category: 'Full Stack',
    featured: true,
    order: 2
  },
  {
    title: 'Interactive Portfolio System (Sample)',
    slug: 'interactive-portfolio-system-sample',
    description: 'Responsive developer showcase template featuring smooth animations, live GitHub activity, and custom themes.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    githubUrl: 'https://github.com',
    liveUrl: 'https://devvolio.in',
    technologies: ['React', 'Framer Motion', 'Lucide Icons'],
    category: 'Frontend',
    featured: true,
    order: 3
  }
];

export default function ProjectsGrid({ projects = [] }: ProjectsGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hasUserProjects = projects && projects.length > 0;
  const displayProjects = hasUserProjects ? projects : sampleProjects;

  const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Tilt calculations
    const rotateX = -(y / rect.height) * 15; // Max 15 degree rotate
    const rotateY = (x / rect.width) * 15;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleCardMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  // Filter projects by category and search queries
  const filteredProjects = displayProjects.filter((project) => {
    if (!hasUserProjects) return true; // Show all sample projects when no user projects
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="projects" className="py-24 px-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
        <div className="text-left">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Featured Projects
          </h2>
          <p className="font-sans text-base text-muted-foreground max-w-md leading-relaxed">
            A showcase of systems engineered to solve real-world problems.
          </p>
        </div>

        {/* Search Bar - Only show when user has projects */}
        {hasUserProjects && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card/50 backdrop-blur-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors hover-glow-trigger"
            />
          </div>
        )}
      </div>

      {/* Admin Panel setup notice when user has no projects */}
      {!hasUserProjects && (
        <div className="mb-10 p-4 rounded-xl border border-primary/30 bg-primary/10 text-center text-xs text-foreground font-medium shadow-sm flex items-center justify-center gap-2 max-w-2xl mx-auto">
          <FolderPlus className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            <strong className="text-primary font-bold">Sample View:</strong> Add your projects in the Admin Panel to replace these sample cards with your real work.
          </span>
        </div>
      )}

      {/* Category Filter Tabs - Only show when user has projects */}
      {hasUserProjects && (
        <div className="flex flex-wrap gap-2.5 mb-10 pb-2 border-b border-border/20">
          {['All', 'Frontend', 'Full Stack', 'SaaS', 'Other'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all hover-glow-trigger ${
                activeCategory === category
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'bg-card/45 border border-border/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Card Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={project.slug}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="group relative rounded-xl border border-border bg-card/30 backdrop-blur-md overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-primary/25 cursor-pointer hover:shadow-2xl shadow-primary/5 hover-glow-trigger"
              style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out' }}
            >
              {/* Thumbnail Container */}
              <div className="relative h-48 w-full overflow-hidden bg-muted/20 border-b border-border/50">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-sm text-[10px] font-bold text-primary border border-border/40 uppercase">
                  {project.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between text-left">
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 mb-2">
                    {project.title}
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Card footer details */}
                <div>
                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-muted/65 text-muted-foreground text-[9px] font-bold"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-muted/65 text-muted-foreground text-[9px] font-bold">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex justify-between items-center border-t border-border/40 pt-4">
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-semibold hover-glow-trigger"
                      >
                        <Github className="w-4 h-4" /> Code
                      </a>
                    ) : (
                      <span className="text-muted-foreground/30 inline-flex items-center gap-1 text-xs font-semibold select-none">
                        <Github className="w-4 h-4" /> Internal
                      </span>
                    )}

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-foreground inline-flex items-center gap-1 text-xs font-semibold hover-glow-trigger"
                      >
                        <Globe className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
